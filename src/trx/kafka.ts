import { Kafka, SASLMechanism } from "kafkajs";
import { KafkaConfig } from "./config";
import { consumeWrapEvent } from "./consumeWrapEvent";

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

const connectKafkaProducer = async () => {
    try {
        await producer.connect()

        console.log(`Kafka: producer connected`)
    } catch (e) {
        console.error(`Kafka: producer disconnected`)
        throw e
    }
}


if (!KafkaConfig.trxGroupId) throw new Error(`TRX: consumer groupId must be provided`)

const consumer = kafka.consumer({ groupId: KafkaConfig.trxGroupId })

const connectKafkaConsumer = async () => {
    try {
        console.log(`KAFKA: connecting ...`)

        console.log(`   -> consumer connecting ...`)
        await consumer.connect()
        console.log(`   -> consumer connected`)

        await Promise.all([
            consumer.subscribe({
                topic: KafkaConfig.topicPrefix ? KafkaConfig.topicPrefix + '.' + KafkaConfig.topics.wrap : KafkaConfig.topics.unwrap, fromBeginning: true
            })
        ])

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const data_string = message.value?.toString()

                    console.log({ topic, data_string })

                    if (!data_string) throw new Error(`consumer receive message null value`)

                    const data = JSON.parse(data_string)

                    switch (topic) {
                        case KafkaConfig.topicPrefix ? (KafkaConfig.topicPrefix + '.' + KafkaConfig.topics.unwrap) : KafkaConfig.topics.unwrap:
                            await consumeWrapEvent(data)
                            break;

                        default: throw new Error(`topic ${topic} not be implemented`)
                    }
                } catch (e) {
                    throw e
                }
            }
        })
    } catch (e) {
        throw e
    }
}

export { producer, consumer, connectKafkaProducer, connectKafkaConsumer }