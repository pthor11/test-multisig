import { connect, Db, MongoClient } from "mongodb";
import { mongoUri } from "./config";

export let client: MongoClient
export let db: Db

export const collectionNames = {
    unwraps: 'event.unwraps'
}

export const connectDb = async () => {
    if (!mongoUri) throw new Error(`BTC: mongo uri must be provided`)

    try {
        client = await connect(mongoUri, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            ignoreUndefined: true
        })

        client.on('error', async (e) => {
            try {
                await client.close()
                await connectDb()
            } catch (e) {
                setTimeout(connectDb, 1000)
                throw e
            }
        })

        client.on('timeout', async () => {
            try {
                await client.close()
                await connectDb()
            } catch (e) {
                setTimeout(connectDb, 1000)
                throw e
            }
        })

        client.on('close', async () => {
            try {
                await connectDb()
            } catch (e) {
                throw e
            }
        })

        db = client.db()

        await Promise.all([
            // db.collection(collectionNameFingerPrint).createIndexes(FingerPrintIndexes),
            // db.collection(collectionNameUnwrapEvent).createIndexes(UnwrapIndexes)
        ])

        console.log(`Mongodb: connected`)
    } catch (e) {
        console.error(`Mongodb: disconnected`)
        setTimeout(connectDb, 1000)
        throw e
    }
}