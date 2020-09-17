import { connectKafkaConsumer } from "./kafka"

const start = async() => {
    try {
        await connectKafkaConsumer()

    } catch (e) {
        throw e
    }
}

start()