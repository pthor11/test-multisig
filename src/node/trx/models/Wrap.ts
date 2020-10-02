import { IndexSpecification, ObjectID } from "mongodb"
import { client, collectionNames, db } from "../../mongo"

export type Wrap = {
    createdAt: Date
    updatedAt: Date
    btcHash: string
    userTrxAddress: string
    amount: number
    consumers: {
        trxAddress: string,
        data: any
        trxHash: string
    }[]
}

export const WrapIndexes: IndexSpecification[] = [
    { key: { userTrxAddress: 1 } },
    { key: { btcHash: 1 }, unique: true }
]

export const insertWrapEventToDb = async (btcHash: string, userTrxAddress: string, amount: number): Promise<ObjectID | null> => {
    const session = client.startSession()
    session.startTransaction()
    try {
        const doc = await db.collection(collectionNames.wraps).findOne({ btcHash }, { session })

        if (doc) {
            await session.abortTransaction()
            session.endSession()

            return null
        } else {
            const { insertedId } = await db.collection(collectionNames.wraps).insertOne({
                btcHash,
                userTrxAddress,
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
        if (e.code === 112) return insertWrapEventToDb(btcHash, userTrxAddress, amount)
        throw e
    }
}