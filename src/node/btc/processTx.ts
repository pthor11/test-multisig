import { multisigAddress } from "../config"
import { BtcTxProcessStatus } from "../models/BtcTx"
import { WrapperEvent } from "../models/WrapperEvent"
import { WrapMessage } from "../models/Message.process"
import { collectionNames, db } from "../mongo"
import { tronWeb } from "../trx/tronWeb"

const processWrapTx = async (raw: any) => {
    try {
        const ouput = raw.vout.find(output => output.isAddress && output.addresses.find(address => address === multisigAddress))
        const opreturnOutput = raw.vout.find(output => !output.isAddress && output.addresses.find(address => address.includes('OP_RETURN')))

        const subHex = opreturnOutput ? opreturnOutput.hex.substr(4) : ''

        const userTrxAddress = Buffer.from(subHex, 'hex').toString()

        const userAmount = parseInt(ouput.value)

        console.log({ raw, userTrxAddress, userAmount, isTrxAddress: tronWeb.isAddress(userTrxAddress) })

        if (!tronWeb.isAddress(userTrxAddress)) {
            await db.collection(collectionNames.btcTxs).updateOne({ "raw.txid": raw.txid }, {
                $set: {
                    processed: true,
                    status: BtcTxProcessStatus.invalidUserTrxAddress,
                    updatedAt: new Date()
                }
            })

            return false
        }

        // sent Wrap Event to trx process
        const wrapMessage: WrapMessage = {
            btcHash: raw.txid,
            btcTime: new Date(raw.blockTime * 1000),
            userTrxAddress,
            userAmount
        }

        if (!process.send) throw new Error(`process.send not found to send wrap message`)

        process.send(wrapMessage)

        await Promise.all([
            db.collection(collectionNames.btcTxs).updateOne({ "raw.txid": raw.txid }, {
                $set: {
                    processed: true,
                    status: BtcTxProcessStatus.sentWrapEventToTrx,
                    updatedAt: new Date()
                }
            }),
            db.collection(collectionNames.wraps).insertOne({
                btcHash: raw.txid,
                btcTime: new Date(raw.blockTime * 1000),
                userTrxAddress,
                userAmount,
                createdAt: new Date()
            })
        ])
    } catch (e) {
        throw e
    }
}

const processUnWrapTx = async (raw: any) => {
    try {
        await db.collection(collectionNames.btcTxs).updateOne({ "raw.txid": raw.txid }, {
            $set: {
                processed: true,
                status: 'UnWrap pending ....',
                updatedAt: new Date()
            }
        })
    } catch (e) {
        throw e
    }
}

const processTx = async () => {
    try {
        const unprocessedTx = await db.collection(collectionNames.btcTxs).findOne({ processed: false }, { sort: { "raw.blockHeight": 1 }, projection: { _id: false, "raw.txid": true, "raw.vin": true, "raw.vout": true, "raw.blockTime": true } })

        const raw = unprocessedTx?.raw

        // console.log({ raw })

        if (!raw) return setTimeout(processTx, 1000)

        const type = raw.vin.find(input => input.isAddress && input.addresses.includes(multisigAddress)) ? WrapperEvent.UnWrap : WrapperEvent.Wrap

        console.log({ raw, type })

        type === WrapperEvent.Wrap ? await processWrapTx(raw) : await processUnWrapTx(raw)

        setTimeout(processTx, 100)
    } catch (e) {
        setTimeout(processTx, 1000)
        throw e
    }
}

export { processTx }