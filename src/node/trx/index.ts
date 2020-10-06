import { connectDb } from "../mongo"
import { processEvent } from "./processEvent"
import { processWrapMessage } from "./processWrapMessage"
import { syncEvents } from "./syncEvents"

const startTrx = async () => {
    try {
        await connectDb()

        await syncEvents()

        await processEvent()

        process.on('message', msg => processWrapMessage(msg))
    } catch (e) {
        throw e
    }
}

startTrx()