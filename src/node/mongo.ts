import { connect, Db, MongoClient } from "mongodb";
import { mongoUri } from "./config";
import { BtcTxIndexes } from "./models/BtcTx";
import { TrxEventIndexes } from "./models/TrxEvent";
// import { WrapIndexes } from "./models/Wrap";

export let client: MongoClient
export let db: Db

export const collectionNames = {
    syncs: 'syncs',
    btcTxs: 'btcTxs',
    trxEvents: 'trxEvents',
    wraps: 'wraps',
    unwraps: 'unwraps'
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
            db.collection(collectionNames.btcTxs).createIndexes(BtcTxIndexes),
            db.collection(collectionNames.trxEvents).createIndexes(TrxEventIndexes)
        ])

        console.log(`Mongodb: connected`)
    } catch (e) {
        console.error(`Mongodb: disconnected`)
        await client?.close(true)
        setTimeout(connectDb, 1000)
        throw e
    }
}