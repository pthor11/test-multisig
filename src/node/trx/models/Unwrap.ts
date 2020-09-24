import { RecordMetadata } from "kafkajs"
import { IndexSpecification, ObjectID } from "mongodb"
import { client, collectionNames, db } from "../mongo"

export type Unwrap = {
    createdAt: Date
    updatedAt: Date
    trxHash: string
    userBtcAddress: string
    amount: number
    producer: {
        trxAddress: string,
        record: RecordMetadata[]
    }
}

export const UnwrapIndexes: IndexSpecification[] = [
    { key: { createdAt: 1 } },
    { key: { updatedAt: 1 } },
    { key: { trxHash: 1 }, unique: true }
]

export const insertUnwrapToDb = async (trxHash: string, userBtcAddress: string, amount: number): Promise<ObjectID | null> => {
    const session = client.startSession()
    session.startTransaction()
    try {
        const doc = await db.collection(collectionNames.unwraps).findOne({ trxHash }, { session })

        if (doc) {
            await session.abortTransaction()
            session.endSession()

            return null
        } else {
            const { insertedId } = await db.collection(collectionNames.unwraps).insertOne({
                trxHash,
                userBtcAddress,
                amount,
                createdAt: new Date()
            }, { session })

            await session.commitTransaction()
            session.endSession()

            return insertedId
        }
    } catch (e) {
        await session.abortTransaction()
        session.endSession()
        if (e.code === 112) return insertUnwrapToDb(trxHash, userBtcAddress, amount)
        throw e
    }
}