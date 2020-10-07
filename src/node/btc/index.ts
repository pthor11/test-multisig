import { connectDb } from "../mongo"
import { connectKafkaProducer } from "./kafka"
import { processTx } from "./processTx"
import { syncTxs } from "./syncTxs"
import { processUnWrapMessage } from "./processUnwrapMessage"

const startBtc = async() => {
    try {
        await connectDb()

        await connectKafkaProducer()

        await syncTxs()

        await processTx()

        process.on('message', msg => processUnWrapMessage(msg))

    } catch (e) {
        throw e
    }
}

startBtc()