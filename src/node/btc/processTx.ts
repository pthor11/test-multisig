import { multisigAddress, wrapperAmounMinimum } from "../config"
import { WrapTxProcessStatus } from "../models/Tx"
import { ActionType } from "../models/Action"
import { WrapMessage } from "../models/Message"
import { collectionNames, db } from "../mongo"
import { tronWeb } from "../trx/tronWeb"

const processWrapTx = async (raw: any) => {
    try {
        const ouput = raw.vout.find(output => output.isAddress && output.addresses.find(address => address === multisigAddress))
        const opreturnOutput = raw.vout.find(output => !output.isAddress && output.addresses.find(address => address.includes('OP_RETURN')))

        const subHex = opreturnOutput ? opreturnOutput.hex.substr(4) : ''

        const userTrxAddress = Buffer.from(subHex, 'hex').toString()

        const userAmount = parseInt(ouput.value)

        console.log({ raw: raw.txid, userTrxAddress, userAmount, isTrxAddress: tronWeb.isAddress(userTrxAddress) })

        const errors: string[] = []

        if (!tronWeb.isAddress(userTrxAddress)) errors.push(WrapTxProcessStatus.invalidTrxAddress)

        if (userAmount < wrapperAmounMinimum) errors.push(WrapTxProcessStatus.invalidAmount)

        if (errors.length !== 0) {
            await db.collection(collectionNames.txs).updateOne({ "raw.txid": raw.txid }, {
                $set: {
                    processed: true,
                    status: errors,
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

        await db.collection(collectionNames.txs).updateOne({ "raw.txid": raw.txid }, {
            $set: {
                processed: true,
                status: WrapTxProcessStatus.sentWrapToTrx,
                updatedAt: new Date()
            }
        })

        process.send(wrapMessage)

        await db.collection(collectionNames.wraps).insertOne({
            btcHash: raw.txid,
            btcTime: new Date(raw.blockTime * 1000),
            userTrxAddress,
            userAmount,
            createdAt: new Date()
        })

    } catch (e) {
        throw e
    }
}

const processUnwrapTx = async (raw: any) => {
    try {
        await db.collection(collectionNames.txs).updateOne({
            "raw.txid": raw.txid
        }, {
            $set: {
                processed: true,
                type: ActionType.unwrap,
                updatedAt: new Date()
            }
        })
    } catch (e) {
        throw e
    }
}

const processTx = async () => {
    try {
        const unprocessedTx = await db.collection(collectionNames.txs).findOne({
            processed: false
        }, {
            sort: { "raw.blockHeight": 1 }
        })

        const raw = unprocessedTx?.raw

        // console.log({ raw })

        if (!raw) return setTimeout(processTx, 1000)

        const type = raw.vin.find(input => input.isAddress && input.addresses.includes(multisigAddress)) ? ActionType.unwrap : ActionType.wrap

        // console.log({ raw, type })

        switch (type) {
            case ActionType.wrap:
                await processWrapTx(raw)
                break;
        
            case ActionType.unwrap:
                await processUnwrapTx(raw)
                break;
        
            default:
                break;
        }

        setTimeout(processTx, 100)
    } catch (e) {
        setTimeout(processTx, 1000)
        throw e
    }
}

export { processTx }