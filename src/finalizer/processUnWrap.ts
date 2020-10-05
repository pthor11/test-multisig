import { Psbt } from "bitcoinjs-lib"
import { callBlockbook } from "./blockbook"
import { blockbookMethods, network, sendInterval, signatureMinimum } from "./config"
import { UnWrap } from "./models/UnWrap"
import { collectionNames, db } from "./mongo"

const processUnWrap = async () => {
    try {
        const readyUnWrap: UnWrap | null = await db.collection(collectionNames.unwraps).findOne({
            processed: false,
            $or: [{
                signeds: { $size: 2 }
            }, {
                signeds: { $size: 3 }
            }]
        }, { sort: { createdAt: 1 } })

        console.log({ readyUnWrap })

        if (readyUnWrap) {
            const basePsbt = Psbt.fromBase64(readyUnWrap.base, { network })
            const signedPsbts = readyUnWrap.signeds.slice(0, 2).map(signed => Psbt.fromBase64(signed, { network }))

            basePsbt.combine(...signedPsbts)

            basePsbt.finalizeAllInputs()

            const txRawHex = basePsbt.extractTransaction().toHex()

            console.log({ txRawHex })

            const { result } = await callBlockbook({
                method: blockbookMethods.sendtx,
                data: txRawHex
            })

            console.log({ txId: result })

            await db.collection(collectionNames.unwraps).updateOne({
                trxHash: readyUnWrap.trxHash
            }, {
                $set: {
                    btcHash: result,
                    updatedAt: new Date()
                }
            })
        }

        setTimeout(processUnWrap, sendInterval)
    } catch (e) {
        setTimeout(processUnWrap, sendInterval)
        console.error(e.response?.data || JSON.stringify(e))
        throw e
    }
}

export { processUnWrap }