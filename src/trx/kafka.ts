import { Kafka, SASLMechanism } from "kafkajs";
import { KafkaConfig } from "./config";

const kafka = new Kafka({
    clientId: KafkaConfig.trxClientId,
    brokers: KafkaConfig.brokers?.split(',') || [],
    ssl: KafkaConfig.mechanism ? true : false,
    sasl: KafkaConfig.mechanism && KafkaConfig.username && KafkaConfig.password ? {
        mechanism: KafkaConfig.mechanism as SASLMechanism,
        username: KafkaConfig.username,
        password: KafkaConfig.password,
    } : undefined,
    connectionTimeout: 5000,
    requestTimeout: 60000,
})

const producer = kafka.producer()

producer.on("producer.disconnect", () => console.error(`Kafka: producer disconnected`))
producer.on("producer.network.request_timeout", () => console.error(`Kafka: producer request timeout`))

export const connectKafkaProducer = async () => {
    try {
        await producer.connect()

        console.log(`Kafka: producer connected`)
    } catch (e) {
        console.error(`Kafka: producer disconnected`)
        throw e
    }
}

export { producer }