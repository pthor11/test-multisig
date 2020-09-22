import { connectKafkaConsumer, connectKafkaProducer } from "./kafka"
import { connectDb } from "./mongo"

const start = async() => {
    try {
        await connectDb()
        
        // await connectKafkaProducer()
        
        // await connectKafkaConsumer()

        // await syncTransactions()

    } catch (e) {
        throw e
    }
}

start()