import { Kafka, SASLMechanism } from "kafkajs";
import { kafkaConfig } from "./config";
import { processKafkaMessage } from "./processKafkaMessage";

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

const consumer = kafka.consumer({ groupId: kafkaConfig.groupId })

const connectKafkaConsumer = async () => {
    try {
        await consumer.connect()

        console.log(`Kafka: consumer connected`)

        await consumer.subscribe({ topic: kafkaConfig.topic.psbt, fromBeginning: true })

        console.log(`Kafka: consumer subcribed topic ${kafkaConfig.topic.psbt}`)

        await consumer.run({ eachMessage: processKafkaMessage })
    } catch (e) {
        console.error(`Kafka: consumer disconnected`)
        throw e
    }
}

export {
    consumer,
    connectKafkaConsumer
}