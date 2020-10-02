import { connectDb } from "../mongo"
import { processTx } from "./processTx"
import { syncTxs } from "./syncTxs"

const startBtc = async() => {
    try {
        await connectDb()

        await syncTxs()
        
        // await connectKafkaProducer()
        
        // await connectKafkaConsumer()

        await processTx()

    } catch (e) {
        throw e
    }
}

startBtc()