import { custodianAddress, eventRequestInterval, KafkaConfig, maxEventReturnSize, unwrapEventName, wrapperAddress } from "./config"
import { producer } from "./kafka"
import { collectionNameFingerPrint, FingerPrint, insertFingerPrintToDb } from "./models/FingerPrint"
import { insertUnwrapToDb } from "./models/Unwrap"
import { insertUnwrapRecordToDb } from "./models/UnwrapRecord"
import { db } from "./mongo"
import { tronWeb } from "./tronWeb"

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
        const lastFingerPrint = await db.collection(collectionNameFingerPrint).findOne({ custodian: custodianAddress }, { limit: 1, sort: { createdAt: -1 } }) as FingerPrint

        // console.log({ lastFingerPrint })

        const options = { eventName: unwrapEventName, size: maxEventReturnSize, onlyConfirmed: true }

        if (lastFingerPrint) options['fingerprint'] = lastFingerPrint.fingerprint

        const results = await tronWeb.getEventResult(wrapperAddress, options)

        for (const result of results) {
            // console.log({ result })

            if (result.fingerprint) await insertFingerPrintToDb(result.fingerprint)

            delete result.fingerprint

            if (result.transaction) {
                const isInserted = await insertUnwrapToDb(result)
                if (isInserted) {
                    const record = await producer.send({
                        topic: KafkaConfig.topicPrefix ? KafkaConfig.topicPrefix + '.' + KafkaConfig.topics.unwrap : KafkaConfig.topics.unwrap,
                        messages: [{
                            value: JSON.stringify({
                                custodian: custodianAddress,
                                result
                            })
                        }]
                    })
                    await insertUnwrapRecordToDb(result, record)
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