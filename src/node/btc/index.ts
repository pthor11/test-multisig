import { connectDb } from "../mongo"
import { processBtcTx } from "./processBtcTx"
import { syncBtcTxs } from "./syncBtcTxs"

const startBtc = async() => {
    try {
        await connectDb()
        
        // await connectKafkaProducer()
        
        // await connectKafkaConsumer()

        await syncBtcTxs()

        // await processBtcTx()

    } catch (e) {
        throw e
    }
}

startBtc()