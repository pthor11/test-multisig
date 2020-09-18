import { connectKafkaConsumer, connectKafkaProducer } from "./kafka"
import { connectDb } from "./mongo"

const start = async() => {
    try {
        await connectDb()
        
        await connectKafkaProducer()
        await connectKafkaConsumer()

    } catch (e) {
        throw e
    }
}

start()