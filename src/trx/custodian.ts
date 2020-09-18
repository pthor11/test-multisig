import { collectionNames, db } from "./mongo"
import { producer } from "./kafka"
import { tronWeb } from "./tronWeb"
import { custodianAddress, eventRequestInterval, KafkaConfig, maxEventReturnSize, unwrapEventName, wrapperAddress } from "./config"
import { FingerPrint, insertFingerPrintToDb } from "./models/FingerPrint"
import { insertUnwrapToDb } from "./models/Unwrap"

const wrap = async (tx: string, amount: number, address: string) => {
    try {
        const contract = await tronWeb.contract().at(wrapperAddress)

        // console.log({ contract });

        const result = await contract.custodianConfirm('0x' + tx, amount, address).send({ callValue: 0 })

        console.log({ result })

    } catch (e) {
        throw e
    }
}

// wrap('f5931122aa7449c3b3b182fec18b75ab1bfda917c1541603debb3afab3a9cdc7', 100, 'TSWVGDF84HNQgxV1JNcnqLytvmzzD8ioES').then(console.log).catch(console.error)

const checkUnwrapEvents = async () => {
    try {
        const lastFingerPrint = await db.collection(collectionNames.fingerprints).findOne({ custodian: custodianAddress }, { limit: 1, sort: { createdAt: -1 } }) as FingerPrint

        // console.log({ lastFingerPrint })

        const options = { eventName: unwrapEventName, size: maxEventReturnSize, onlyConfirmed: true }

        if (lastFingerPrint) options['fingerprint'] = lastFingerPrint.fingerprint

        const results = await tronWeb.getEventResult(wrapperAddress, options)

        console.log({ results: results.length });

        for (const result of results) {
            // console.log({ result })

            if (result.fingerprint) await insertFingerPrintToDb(result.fingerprint)

            delete result.fingerprint

            if (result.transaction) {
                const insertedId = await insertUnwrapToDb(result)

                if (insertedId) {
                    const record = await producer.send({
                        topic: KafkaConfig.topicPrefix ? KafkaConfig.topicPrefix + '.' + KafkaConfig.topics.unwrap : KafkaConfig.topics.unwrap,
                        messages: [{
                            value: JSON.stringify({
                                custodian: custodianAddress,
                                result
                            })
                        }]
                    })
                    await db.collection(collectionNames.unwraps).updateOne({
                        _id: insertedId
                    }, {
                        $set: {
                            producer: { custodian: custodianAddress, record },
                            updatedAt: new Date()
                        }
                    })
                }
            }
        }

        setTimeout(checkUnwrapEvents, eventRequestInterval)
    } catch (e) {
        setTimeout(checkUnwrapEvents, eventRequestInterval)
        throw e
    }
}

export { checkUnwrapEvents }