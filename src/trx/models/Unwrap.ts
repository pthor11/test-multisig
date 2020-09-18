import { RecordMetadata } from "kafkajs"
import { IndexSpecification, ObjectID } from "mongodb"
import { client, db } from "../mongo"

export const collectionNameUnwrapEvent = 'trx.unwraps'

export type Unwrap = {
    createdAt: Date
    updatedAt: Date
    result: any
    producer: {
        custodian: string,
        record: RecordMetadata[]
    }
}

export const UnwrapIndexes: IndexSpecification[] = [
    { key: { createdAt: 1 } },
    { key: { updatedAt: 1 } },
    { key: { "result.block": 1 } },
    { key: { "result.timestamp": 1 } },
    { key: { "result.toAddress": 1 } },
    { key: { "result.transaction": 1 }, unique: true }
]

export const insertUnwrapToDb = async (result: any): Promise<ObjectID | null> => {
    const session = client.startSession()
    session.startTransaction()
    try {
        const doc = await db.collection(collectionNameUnwrapEvent).findOne({ "result.transaction": result.transaction }, { session })

        if (doc) {
            await session.abortTransaction()
            session.endSession()

            return null
        } else {
            const { insertedId } = await db.collection(collectionNameUnwrapEvent).insertOne({
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
        if (e.code === 112) return insertUnwrapToDb(result)
        throw e
    }
}