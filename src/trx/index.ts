import { checkUnwrapEvents } from "./custodian"
import { connectKafkaProducer } from "./kafka"
import { connectDb } from "./mongo"

const start = async() => {
    try {
        await connectDb()
        
        // await connectKafkaProducer()

        // await checkUnwrapEvents()
    } catch (e) {
        throw e
    }
}

start()