import { connectDb } from "../mongo"
import { processWrapMessage } from "./processWrapMessage"

const startTrx = async () => {
    try {
        await connectDb()

        process.on('message', msg => processWrapMessage(msg))
    } catch (e) {
        throw e
    }
}

startTrx()