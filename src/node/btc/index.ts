import { connectDb } from "../mongo"
import { connectKafkaProducer } from "./kafka"
import { processTx } from "./processTx"
import { syncTxs } from "./syncTxs"
import { processUnWrapMessage } from "./processUnWrapMessage"

const startBtc = async() => {
    try {
        await connectDb()

        await connectKafkaProducer()

        // await syncTxs()
        
        // await connectKafkaProducer()
        
        // await connectKafkaConsumer()

        // await processTx()

        process.on('message', msg => processUnWrapMessage(msg))

    } catch (e) {
        throw e
    }
}

startBtc()