import { client, collectionNames, db } from "../mongo"
import { Psbt } from "bitcoinjs-lib";
import { blockbookMethods, btcAddress, network, signatureMinimum } from "../config";
import { callBlockbook } from "./blockbook";
import { psbts } from "./psbts";

const updateSendTxToUnwrapEvent = async ({ transaction, txRawHex, txId }: { transaction: string, txRawHex: string, txId: string }) => {
    const session = client.startSession()
    session.startTransaction()
    try {
        const { value } = await db.collection(collectionNames.unwraps).findOneAndUpdate({ "result.transaction": transaction }, {
            $set: {
                "consumer.txRawHex": txRawHex,
                "consumer.txid": txId,
                "consumer.sentBy": btcAddress,
                updateAt: new Date()
            }
        }, {
            returnOriginal: true,
            session
        })

        if (!value) throw new Error(`transaction ${transaction} not found to unwrap`)

        if (value.consumer?.txRawHex || value.consumer?.txId || value.consumer?.sentBy) {
            await session.abortTransaction()
        } else {
            await session.commitTransaction()
        }

        session.endSession()
    } catch (e) {
        await session.abortTransaction()
        session.endSession()
        if (e.code === 112) return updateSendTxToUnwrapEvent({ transaction, txRawHex, txId })
        throw e
    }
}

export const consumeSignEvents = async (data: any) => {
    let transaction, txRawHex: string = ''

    try {
        console.log({ consumeSignEvent: data })

        transaction = data.transaction
        const basePsbtHex = data.basePsbtHex
        const signedPsbtHex = data.signedPsbtHex

        if (!transaction) throw new Error(`consumer received sign message with no transaction`)
        if (!basePsbtHex) throw new Error(`consumer received sign message for transaction ${transaction} with no basePsbtHex`)
        if (!signedPsbtHex) throw new Error(`consumer received sign message for transaction ${transaction} with no signedPsbtHex`)

        if (psbts[transaction]) {
            psbts[transaction].baseHex = psbts[transaction].baseHex || basePsbtHex
            psbts[transaction].signedHexs = psbts[transaction].signedHexs ? (psbts[transaction].signedHexs.includes(signedPsbtHex) ? psbts[transaction].signedHexs : [...psbts[transaction].signedHexs, signedPsbtHex]) : [signedPsbtHex]

            console.log({ psbts: JSON.stringify(psbts) })


            if (psbts[transaction].signedHexs.length === signatureMinimum && !psbts[transaction].txId) {
                const psbt = Psbt.fromBase64(basePsbtHex, { network })
                psbt.combine(...psbts[transaction].signedHexs.map(hex => Psbt.fromBase64(hex, { network })))
                psbt.finalizeAllInputs()

                txRawHex = psbt.extractTransaction().toHex()

                console.log({ txRawHex })

                const { result } = await callBlockbook({ method: blockbookMethods.sendtx, data: txRawHex })

                console.log({ txId: result })

                psbts[transaction].txId = result

                await updateSendTxToUnwrapEvent({ transaction, txRawHex, txId: result })
            }
        } else {
            psbts[transaction] = {
                baseHex: basePsbtHex,
                signedHexs: [signedPsbtHex]
            }
        }
    } catch (e) {
        const error = e.response?.data?.error
        if (error?.includes('min relay fee not met')) {
            return consumeSignEvents(data)
        } else if (!error?.includes('txn-mempool-conflict') && !error?.includes('transaction in blockchain')) {
            throw e
        }
    }
}