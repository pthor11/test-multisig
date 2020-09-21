import { RecordMetadata } from "kafkajs"
import { IndexSpecification, ObjectID } from "mongodb"
import { client, collectionNames, db } from "../mongo"

export type Wrap = {
    createdAt: Date
    updatedAt: Date
    result: any
    producer: {
        btcAddress: string,
        record: RecordMetadata[]
    }
}

export const WrapIndexes: IndexSpecification[] = [
    { key: { createdAt: 1 } },
    { key: { updatedAt: 1 } },
    { key: { "result.blockHeight": 1 } },
    { key: { "result.blockTime": 1 } },
    { key: { "result.toAddress": 1 } },
    { key: { "result.txid": 1 }, unique: true }
]

export const insertWrapToDb = async (result: any): Promise<ObjectID | null> => {
    const session = client.startSession()
    session.startTransaction()
    try {
        const doc = await db.collection(collectionNames.wraps).findOne({ "result.txid": result.txid }, { session })

        if (doc) {
            await session.abortTransaction()
            session.endSession()

            return null
        } else {
            const { insertedId } = await db.collection(collectionNames.wraps).insertOne({
                result,
                createdAt: new Date()
            }, { session })

            await session.commitTransaction()
            session.endSession()

            return insertedId
        }
    } catch (e) {
        await session.abortTransaction()
        session.endSession()
        if (e.code === 112) return insertWrapToDb(result)
        throw e
    }
}