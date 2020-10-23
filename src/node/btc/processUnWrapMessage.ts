import { kafkaConfig } from "../config";
import { UnWrapMessage } from "../models/Message";
import { collectionNames, db } from "../mongo";
import { producer } from "./kafka";
import { createPsbtRawHex } from "./multisig.node";

const processUnWrapMessage = async (msg: UnWrapMessage) => {
    try {
        console.log({ msg })

        await db.collection(collectionNames.unwraps).insertOne({
            processed: false,
            ...msg,
            createdAt: new Date()
        })
        
        // // signing message and send to kafka

        // const { base, signed } = await createPsbtRawHex(msg)

        // const record = await producer.send({
        //     topic: kafkaConfig.topic.psbt,
        //     messages: [{
        //         value: JSON.stringify({
        //             trxHash: msg.trxHash,
        //             base,
        //             signed
        //         })
        //     }]
        // })

        // console.log({ record })

        // await db.collection(collectionNames.trxEvents).updateOne({ "raw.transaction": msg.trxHash }, {
        //     $set: {
        //         processed: true,
        //         status: TrxEventProcessStatus.sentSignedPsbtToKafka,
        //         updatedAt: new Date()
        //     }
        // })

    } catch (e) {
        console.error(`btc processUnWrapMessage error. Retrying ... ${JSON.stringify(e.response?.data || e.message)}`)
        // processUnWrapMessage(msg)
        throw e
    }
}

export {
    processUnWrapMessage
}