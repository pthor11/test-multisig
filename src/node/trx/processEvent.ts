import { multisigAddress } from "../config"
import { BtcTxProcessStatus } from "../models/BtcTx"
import { WrapperEvent } from "../models/WrapperEvent"
import { WrapMessage } from "../models/Message.process"
import { collectionNames, db } from "../mongo"
import { tronWeb } from "../trx/tronWeb"

const processWrapEvent = async (event: any) => { }
const processUnWrapEvent = async (event: any) => { }

const processEvent = async () => {
    try {
        const unprocessedEvent = await db.collection(collectionNames.trxEvents).findOne({ processed: false }, { sort: { "raw.block": 1 } })

        const raw = unprocessedEvent?.raw

        console.log({ raw })

        if (!raw) return setTimeout(processEvent, 1000)

        switch (raw.name) {
            case WrapperEvent.Wrap:
                await processWrapEvent(raw)
                break;
            case WrapperEvent.UnWrap:
                await processUnWrapEvent(raw)
                break;

            default: throw new Error(`contract event ${raw.name} is not supported`)
        }

        if (raw.name === WrapperEvent.Wrap) {
            // process Wrap Event
            // const wrapOutput = raw.vout.find(output => output.isAddress && output.addresses.find(address => address === multisigAddress))
            // const op_returnOutput = raw.vout.find(output => !output.isAddress && output.addresses.find(address => address.includes('OP_RETURN')))

            // if (!wrapOutput) throw new Error(`wrapOutput not found`)

            // const subHex = op_returnOutput ? op_returnOutput.hex.substr(4) : ''

            // const userTrxAddress = Buffer.from(subHex, 'hex').toString()

            // const userAmount = parseInt(wrapOutput.value)

            // console.log({ wrapOutput, op_returnOutput, userTrxAddress, userAmount })

            // if (tronWeb.isAddress(userTrxAddress)) {
            //     // sent Wrap Event to trx process
            //     const wrapMessage: WrapMessage = {
            //         btcHash: raw.txid,
            //         userTrxAddress,
            //         userAmount
            //     }

            //     if (!process.send) throw new Error(`process.send not found to send wrap message`)

            //     process.send(wrapMessage)

            //     await Promise.all([
            //         db.collection(collectionNames.btcTxs).updateOne({ "raw.txid": raw.txid }, { $set: { processed: true, status: BtcTxProcessStatus.sentWrapEventToTrx, updatedAt: new Date() } }),
            //         db.collection(collectionNames.wraps).insertOne({
            //             btcHash: raw.txid,
            //             btcTime: new Date(raw.blockTime * 1000),
            //             userTrxAddress,
            //             userAmount,
            //             createdAt: new Date()
            //         })
            //     ])

            // } else {
            //     // update to db with status 
            //     await db.collection(collectionNames.btcTxs).updateOne({ "raw.txid": raw.txid }, { $set: { processed: true, status: BtcTxProcessStatus.invalidUserTrxAddress, updatedAt: new Date() } })
            // }
        } else {
            // process UnWrap Event
            // update to db with status 
            // await db.collection(collectionNames.btcTxs).updateOne({ "raw.txid": raw.txid }, { $set: { processed: true, status: BtcTxProcessStatus.unknown, updatedAt: new Date() } })
        }

        setTimeout(processEvent, 100)
    } catch (e) {
        setTimeout(processEvent, 1000)
        throw e
    }
}

export { processEvent }