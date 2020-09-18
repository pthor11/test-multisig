import { connect, Db, IndexSpecification, MongoClient } from "mongodb";
import { mongoUri } from "./config";
import { FingerPrintIndexes } from "./models/FingerPrint";
import { UnwrapIndexes } from "./models/Unwrap";

export let client: MongoClient
export let db: Db

export const collectionNames = {
    unwraps: 'event.unwraps',
    fingerprints: 'trx.fingerprints'
}

export const connectDb = async () => {
    if (!mongoUri) throw new Error(`TRX: mongo uri must be provided`)

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
            db.collection(collectionNames.fingerprints).createIndexes(FingerPrintIndexes),
            db.collection(collectionNames.unwraps).createIndexes(UnwrapIndexes)
        ])

        console.log(`Mongodb: connected`)
    } catch (e) {
        console.error(`Mongodb: disconnected`)
        setTimeout(connectDb, 1000)
        throw e
    }
}