import { connectDb } from "../mongo"
import { processBtcTx } from "./processBtcTx"
import { syncBtcBlocks } from "./syncBtcBlocks"

const startBtc = async() => {
    try {
        await connectDb()
        
        // await connectKafkaProducer()
        
        // await connectKafkaConsumer()

        await syncBtcBlocks()

        // await processBtcTx()

    } catch (e) {
        throw e
    }
}

startBtc()