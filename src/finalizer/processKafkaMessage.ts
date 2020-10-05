import { EachMessagePayload } from "kafkajs"
import { db, collectionNames } from "./mongo"
import { KafkaMessage } from "./models/KafkaMessage"

const processKafkaMessage = async (payload: EachMessagePayload) => {
    try {
        const { message } = payload
        const dataString = message.value?.toString()

        if (!dataString) throw new Error(`kafka message no value`)

        const data = JSON.parse(dataString) as KafkaMessage

        console.log({ data })

        await db.collection(collectionNames.unwraps).updateOne({ trxHash: data.trxHash }, {
            $addToSet: { signeds: data.signed },
            $set: { updatedAt: new Date() },
            $setOnInsert: {
                processed: false,
                base: data.base,
                createdAt: new Date()
            }
        }, { upsert: true })

    } catch (e) {
        throw e
    }
}


export { processKafkaMessage }