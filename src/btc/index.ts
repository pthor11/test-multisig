import { connectDb } from "../mongo"
import { syncTransactions } from "./syncTransactions"

const startBtc = async() => {
    try {
        await connectDb()
        
        // await connectKafkaProducer()
        
        // await connectKafkaConsumer()

        await syncTransactions()

    } catch (e) {
        throw e
    }
}

startBtc()