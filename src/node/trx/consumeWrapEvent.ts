// import { client, collectionNames, db } from ."./mongo"
// import { KafkaConfig, trxAddress } from "./config";
// import { sendWrapToContract } from "./custodian";
// import { producer } from "./kafka";
// import { insertWrapEventToDb } from "./models/Wrap";

// export const consumeWrapEvent = async (data: any) => {
//     try {
//         console.log({ data })

//         const btcHash = data.btcHash
//         const userTrxAddress = data.userTrxAddress
//         const amount = data.amount

//         if (!btcHash) throw new Error(`consumer received wrap message with no btc hash`)
//         if (!userTrxAddress) throw new Error(`consumer received wrap message with no user trx address`)
//         if (!amount) throw new Error(`consumer received wrap message with invalid amount ${amount}`)

//         const insertedId = await insertWrapEventToDb(btcHash, userTrxAddress, amount)

//         if (insertedId) {
//             const trxHash = await sendWrapToContract(btcHash, amount, userTrxAddress)

//             await db.collection(collectionNames.wraps).updateOne({ _id: insertedId }, {
//                 $addToSet: {
//                     consumers: {
//                         trxAddress,
//                         trxHash,
//                         data
//                     }
//                 }
//             })
//         }

//     } catch (e) {
//         console.error(e)
//         throw e
//     }
// }