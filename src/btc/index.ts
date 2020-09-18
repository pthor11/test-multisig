import { connectKafkaConsumer, connectKafkaProducer } from "./kafka"
import { connectDb } from "./mongo"

const start = async() => {
    try {
        await connectDb()
        
        await connectKafkaConsumer()
        await connectKafkaProducer()

    } catch (e) {
        throw e
    }
}

start()