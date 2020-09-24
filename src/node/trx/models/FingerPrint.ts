// import { IndexSpecification } from "mongodb"
// import { trxAddress } from "../../config"
// import { client, collectionNames, db } from "../../mongo"

// export type FingerPrint = {
//     custodian: string
//     fingerprint: string
//     createdAt: Date
// }

// export const FingerPrintIndexes: IndexSpecification[] = [
//     { key: { createdAt: 1 } },
//     { key: { trxAddress: 1 } },
//     { key: { trxAddress: 1, fingerprint: 1 }, unique: true }
// ]

// export const insertFingerPrintToDb = async (fingerprint: any) => {
//     const session = client.startSession()
//     session.startTransaction()
//     try {
//         const doc = await db.collection(collectionNames.fingerprints).findOne({ trxAddress, fingerprint }, { session })

//         if (doc) {
//             await session.abortTransaction()
//             session.endSession()
            
//             return false
//         } else {
//             await db.collection(collectionNames.fingerprints).insertOne({
//                 trxAddress,
//                 fingerprint,
//                 createdAt: new Date()
//             }, { session })

//             await session.commitTransaction()
//             session.endSession()

//             return true
//         }
//     } catch (e) {
//         await session.abortTransaction()
//         session.endSession()
//         if (e.code === 112) return insertFingerPrintToDb(fingerprint)
//         throw e
//     }
// }