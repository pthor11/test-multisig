import { connectDb } from "../mongo"
import { processWrapMessage } from "./processWrapMessage"
import { syncEvents } from "./syncEvents"

const startTrx = async () => {
    try {
        await connectDb()

        await syncEvents()

        // process.on('message', msg => processWrapMessage(msg))
    } catch (e) {
        throw e
    }
}

startTrx()