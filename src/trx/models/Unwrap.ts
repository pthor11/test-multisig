import { IndexSpecification } from "mongodb"
import { custodianAddress } from "../config"
import { client, db } from "../mongo"

export const collectionNameUnwrapEvent = 'trx.unwraps'

export type Unwrap = {
    custodian: string
    createdAt: Date
    updatedAt: Date
    result: any
}

export const UnwrapIndexes: IndexSpecification[] = [
    { key: { createdAt: 1 } },
    { key: { updatedAt: 1 } },
    { key: { "result.block": 1 } },
    { key: { "result.timestamp": 1 } },
    { key: { "result.toAddress": 1 } },
    { key: { "result.transaction": 1 }, unique: true }
]

export const insertUnwrapToDb = async (result: any) => {
    const session = client.startSession()
    session.startTransaction()
    try {
        const doc = await db.collection(collectionNameUnwrapEvent).findOne({ "result.transaction": result.transaction }, { session })

        if (doc) {
            await session.abortTransaction()
            session.endSession()
            
        } else {
            await db.collection(collectionNameUnwrapEvent).insertOne({
                custodian: custodianAddress,
                result,
                createdAt: new Date()
            }, { session })

            await session.commitTransaction()
            session.endSession()
        }
    } catch (e) {
        await session.abortTransaction()
        session.endSession()
        if (e.code === 112) return insertUnwrapToDb(result)
        throw e
    }
}