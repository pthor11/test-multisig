import { IndexSpecification } from "mongodb"
import { custodianAddress } from "../config"
import { client, db } from "../mongo"

export const collectionNameFingerPrint = 'trx.fingerprints'

export type FingerPrint = {
    custodian: string
    fingerprint: string
    createdAt: Date
}

export const FingerPrintIndexes: IndexSpecification[] = [
    { key: { createdAt: 1 } },
    { key: { custodian: 1 } },
    { key: { custodian: 1, fingerprint: 1 }, unique: true }
]

export const insertFingerPrintToDb = async (fingerprint: any) => {
    const session = client.startSession()
    session.startTransaction()
    try {
        const doc = await db.collection(collectionNameFingerPrint).findOne({ custodian: custodianAddress, fingerprint }, { session })

        if (doc) {
            await session.abortTransaction()
            session.endSession()
            
            return false
        } else {
            await db.collection(collectionNameFingerPrint).insertOne({
                custodian: custodianAddress,
                fingerprint,
                createdAt: new Date()
            }, { session })

            await session.commitTransaction()
            session.endSession()

            return true
        }
    } catch (e) {
        await session.abortTransaction()
        session.endSession()
        if (e.code === 112) return insertFingerPrintToDb(fingerprint)
        throw e
    }
}