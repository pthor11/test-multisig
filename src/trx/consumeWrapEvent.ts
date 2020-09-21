import { client, collectionNames, db } from "./mongo"
import { KafkaConfig } from "./config";
import { wrap } from "./custodian";
import { producer } from "./kafka";

// const updateWrapEvent = async (transaction: string) => {
//     const session = client.startSession()
//     session.startTransaction()
//     try {
//         const { value } = await db.collection(collectionNames.unwraps).findOneAndUpdate({ "result.transaction": transaction }, {
//             $addToSet: { "consumer.signs": btcAddress },
//             $set: { updateAt: new Date() }
//         }, {
//             returnOriginal: true,
//             session
//         })

//         if (!value) throw new Error(`transaction ${transaction} not found to unwrap`)

//         if (value.consumer?.signs?.includes(btcAddress)) {
//             await session.abortTransaction()
//         } else {
//             await session.commitTransaction()
//         }

//         session.endSession()
//     } catch (e) {
//         await session.abortTransaction()
//         session.endSession()
//         if (e.code === 112) return updateUnwrapEvent(transaction)
//         throw e
//     }
// }

export const consumeWrapEvent = async (data: any) => {
    try {
        console.log({ data })

        const transaction = data.transaction
        const trxAdress = data.trxAdress
        const amount = data.amount

        if (!transaction) throw new Error(`consumer received wrap message with no transaction`)
        if (!trxAdress) throw new Error(`consumer received wrap message with no trxAdress`)
        if (!amount) throw new Error(`consumer received wrap message with invalid amount ${amount}`)



        const result = await wrap(transaction.txid, amount, trxAdress)

        console.log({ result })

    } catch (e) {
        console.error(e)
        throw e
    }
}