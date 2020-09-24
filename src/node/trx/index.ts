import { connectDb } from "../mongo"

const startTrx = async () => {
    try {
        await connectDb()

        process.on('message', msg => console.log(`trx received msg`, msg))
    } catch (e) {
        throw e
    }
}

startTrx()