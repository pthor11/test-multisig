import { connectKafkaConsumer } from "./kafka"
import { connectDb } from "./mongo"

const start = async() => {
    try {
        await connectDb()
        
        await connectKafkaConsumer()

    } catch (e) {
        throw e
    }
}

start()