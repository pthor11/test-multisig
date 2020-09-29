import { factoryContractAddress } from "../config"
// import { collectionNames, db } from "./mongo"
// import { producer } from "./kafka"
// import { tronWeb } from "./tronWeb"
// import { trxAddress, eventRequestInterval, /* KafkaConfig, */ maxEventReturnSize, contractEvents, factoryContractAddress } from "../config"
// import { FingerPrint, insertFingerPrintToDb } from "./models/FingerPrint"
// import { insertUnwrapToDb } from "./models/Unwrap"

import { tronWeb } from "./tronWeb"

// const sendWrapToContract = async (btcHash: string, amount: number, userTrxAddress: string) => {
//     try {
//         const contract = await tronWeb.contract().at(contractAddress)

//         // console.log({ contract });

//         const result = await contract.custodianConfirm('0x' + btcHash, amount, userTrxAddress).send({ callValue: 0 })

//         console.log({ result })

//     } catch (e) {
//         throw e
//     }
// }

// const checkUnwrapEvents = async () => {
//     try {
//         const lastFingerPrint = await db.collection(collectionNames.fingerprints).findOne({ trxAddress }, { limit: 1, sort: { createdAt: -1 } }) as FingerPrint

//         // console.log({ lastFingerPrint })

//         const options = { eventName: contractEvents.UnWrap, size: maxEventReturnSize, onlyConfirmed: true }

//         if (lastFingerPrint) options['fingerprint'] = lastFingerPrint.fingerprint

//         const results = await tronWeb.getEventResult(contractAddress, options)

//         console.log({ results: results.length });

//         for (const result of results) {
//             // console.log({ result })

//             if (result.fingerprint) await insertFingerPrintToDb(result.fingerprint)

//             delete result.fingerprint

//             if (result.transaction) {
//                 console.log({ result })

//                 const trxHash = result.transaction
//                 const userBtcAddress = result.toAddress
//                 const amount = result.amount

//                 const data = { trxHash, userBtcAddress, amount }

//                 const insertedId = await insertUnwrapToDb(result.transaction, result.toAddress, result.amount)

//                 if (insertedId) {
//                     const record = await producer.send({
//                         topic: KafkaConfig.topics.unwrap,
//                         messages: [{
//                             value: JSON.stringify(data)
//                         }]
//                     })
//                     await db.collection(collectionNames.unwraps).updateOne({
//                         _id: insertedId
//                     }, {
//                         $set: {
//                             producer: {
//                                 trxAddress,
//                                 record,
//                                 data
//                             },
//                             updatedAt: new Date()
//                         }
//                     })
//                 }
//             }
//         }

//         setTimeout(checkUnwrapEvents, eventRequestInterval)
//     } catch (e) {
//         setTimeout(checkUnwrapEvents, eventRequestInterval)
//         throw e
//     }
// }

// export { sendWrapToContract, checkUnwrapEvents }

const wrapper = async (btcHash: string) => {
    try {
        const factoryContract = await tronWeb.contract().at(factoryContractAddress)

        // console.log({ contract });

        const result = await factoryContract.wrapper('0x' + btcHash).call()

        console.log({ result })
    } catch (e) {
        throw e
    }
}

const wrap = async (btcHash: string, userAmount: number, userTrxAddress: string) => {
    try {
        const factoryContract = await tronWeb.contract().at(factoryContractAddress)

        // console.log({ contract });

        const result = await factoryContract.custodianConfirm('0x' + btcHash, userAmount, tronWeb.address.toHex(userTrxAddress)).send({ callValue: 0 })

        console.log({ result })
    } catch (e) {
        throw e
    }
}

const getFactoryContractEventResults = async (options: { eventName: string, size: number }) => {
    try {
        const results = await tronWeb.getEventResult(factoryContractAddress, options)
        console.log(results)

        for (const result of results) {
            console.log({ result, userTrxAddress: result.result.toAddress, decoded: tronWeb.address.fromHex(result.result.toAddress) });

        }

    } catch (e) {
        throw e
    }
}

const btcHash = '327fff74c3426179e6e9cc07b43330283dde8162cf23eb54bb0b2907df6ac143'
const userAmount = 200
const userTrxAddress = 'TDmYMKhVZTX7Xc2jEtmGmLNp5i8uCEnarT'

// wrap(btcHash, userAmount, userTrxAddress).then(console.log).catch(console.error)

getFactoryContractEventResults({ eventName: 'Wrap', size: 100 }).then(console.log).catch(console.error)

// wrapper(btcHash).then(console.log).catch(console.error)