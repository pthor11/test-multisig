import { kafkaConfig } from "../config";
import { UnWrapMessage } from "../models/Message.process";
import { TrxEventProcessStatus } from "../models/TrxEvent";
import { collectionNames, db } from "../mongo";
import { producer } from "./kafka";
import { createPsbtRawHex } from "./multisig.node";

const processUnWrapMessage = async (msg: UnWrapMessage) => {
    try {
        console.log({ msg })

        if (!msg.trxHash) throw new Error(`unwrap message has invalid trx hash ${msg}`)
        if (!msg.userAmount) throw new Error(`unwrap message has invalid user amount ${msg}`)
        if (!msg.userBtcAddress) throw new Error(`unwrap message has invalid user btc address ${msg}`)

        // signing message and send to kafka

        const { basePsbtHex, signedPsbtHex } = await createPsbtRawHex(msg)

        const record = await producer.send({
            topic: kafkaConfig.topic.psbt,
            messages: [{
                value: JSON.stringify({
                    trxHash: msg.trxHash,
                    base: basePsbtHex,
                    signed: signedPsbtHex
                })
            }]
        })

        console.log({ record })

        await db.collection(collectionNames.trxEvents).updateOne({ "raw.transaction": msg.trxHash }, {
            $set: {
                processed: true,
                status: TrxEventProcessStatus.sentSignedPsbtToKafka,
                updatedAt: new Date()
            }
        })

    } catch (e) {
        console.error(`btc processUnWrapMessage error. Retrying ...`)
        // processUnWrapMessage(msg)
        throw e
    }
}

export {
    processUnWrapMessage
}