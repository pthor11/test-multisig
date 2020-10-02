import { Kafka, SASLMechanism } from "kafkajs";
import { kafkaConfig } from "../config";

const kafka = new Kafka({
    clientId: kafkaConfig.clientId,
    brokers: kafkaConfig.brokers?.split(',') || [],
    ssl: kafkaConfig.mechanism ? true : false,
    sasl: kafkaConfig.mechanism && kafkaConfig.username && kafkaConfig.password ? {
        mechanism: kafkaConfig.mechanism as SASLMechanism,
        username: kafkaConfig.username,
        password: kafkaConfig.password,
    } : undefined,
    connectionTimeout: 5000,
    requestTimeout: 60000,
})

const producer = kafka.producer()

producer.on("producer.disconnect", () => console.error(`Kafka: producer disconnected`))
producer.on("producer.network.request_timeout", () => console.error(`Kafka: producer request timeout`))

const connectKafkaProducer = async () => {
    try {
        await producer.connect()

        console.log(`Kafka: producer connected`)
    } catch (e) {
        console.error(`Kafka: producer disconnected`)
        throw e
    }
}

export {
    producer,
    connectKafkaProducer
}