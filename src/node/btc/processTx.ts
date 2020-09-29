import { multisigAddress } from "../config"
import { BtcTxProcessStatus } from "../models/BtcTx"
import { WrapperEvent } from "../models/WrapperEvent"
import { WrapMessage } from "../models/Message.process"
import { collectionNames, db } from "../mongo"
import { tronWeb } from "../trx/tronWeb"

const processWrapEvent = async (tx: any) => { }
const processUnWrapEvent = async (tx: any) => { }

const processTx = async () => {
    try {
        const unprocessedBtcTx = await db.collection(collectionNames.btcTxs).findOne({ processed: false }, { sort: { "raw.blockHeight": 1 }, projection: { _id: false, "raw.txid": true, "raw.vin": true, "raw.vout": true, "raw.blockTime": true } })

        const raw = unprocessedBtcTx?.raw

        console.log({ raw })

        if (!raw) return setTimeout(processTx, 1000)

        const type = raw.vin.find(input => input.isAddress && input.addresses.includes(multisigAddress)) ? WrapperEvent.UnWrap : WrapperEvent.Wrap

        console.log({ type })

        type === WrapperEvent.Wrap ? await processWrapEvent(raw) : await processWrapEvent(raw)

        // if (type === WrapperEvent.Wrap) {
        //     // process Wrap Event
        //     const wrapOutput = raw.vout.find(output => output.isAddress && output.addresses.find(address => address === multisigAddress))
        //     const op_returnOutput = raw.vout.find(output => !output.isAddress && output.addresses.find(address => address.includes('OP_RETURN')))

        //     if (!wrapOutput) throw new Error(`wrapOutput not found`)

        //     const subHex = op_returnOutput ? op_returnOutput.hex.substr(4) : ''

        //     const userTrxAddress = Buffer.from(subHex, 'hex').toString()

        //     const userAmount = parseInt(wrapOutput.value)

        //     console.log({ wrapOutput, op_returnOutput, userTrxAddress, userAmount })

        //     if (tronWeb.isAddress(userTrxAddress)) {
        //         // sent Wrap Event to trx process
        //         const wrapMessage: WrapMessage = {
        //             btcHash: raw.txid,
        //             userTrxAddress,
        //             userAmount
        //         }

        //         if (!process.send) throw new Error(`process.send not found to send wrap message`)

        //         process.send(wrapMessage)

        //         await Promise.all([
        //             db.collection(collectionNames.btcTxs).updateOne({ "raw.txid": raw.txid }, { $set: { processed: true, status: BtcTxProcessStatus.sentWrapEventToTrx, updatedAt: new Date() } }),
        //             db.collection(collectionNames.wraps).insertOne({
        //                 btcHash: raw.txid,
        //                 btcTime: new Date(raw.blockTime * 1000),
        //                 userTrxAddress,
        //                 userAmount,
        //                 createdAt: new Date()
        //             })
        //         ])

        //     } else {
        //         // update to db with status 
        //         await db.collection(collectionNames.btcTxs).updateOne({ "raw.txid": raw.txid }, { $set: { processed: true, status: BtcTxProcessStatus.invalidUserTrxAddress, updatedAt: new Date() } })
        //     }
        // } else {
        //     // process UnWrap Event
        //     // update to db with status 
        //     // await db.collection(collectionNames.btcTxs).updateOne({ "raw.txid": raw.txid }, { $set: { processed: true, status: BtcTxProcessStatus.unknown, updatedAt: new Date() } })
        // }

        setTimeout(processTx, 100)
    } catch (e) {
        setTimeout(processTx, 1000)
        throw e
    }
}

export { processTx }