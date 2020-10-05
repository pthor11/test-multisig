import { connectDb } from "./mongo"
import { connectKafkaConsumer } from "./kafka"
import { processUnWrap } from "./processUnWrap"

const start = async () => {
    try {
        await connectDb()
        
        await connectKafkaConsumer()
        
        await processUnWrap()
    } catch (e) {
        throw e
    }
}

start()