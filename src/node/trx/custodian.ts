import { collectionNames, db } from "./mongo"
import { producer } from "./kafka"
import { tronWeb } from "./tronWeb"
import { trxAddress, eventRequestInterval, KafkaConfig, maxEventReturnSize, contractEvents, contractAddress } from "./config"
import { FingerPrint, insertFingerPrintToDb } from "./models/FingerPrint"
import { insertUnwrapToDb } from "./models/Unwrap"

const sendWrapToContract = async (btcHash: string, amount: number, userTrxAddress: string) => {
    try {
        const contract = await tronWeb.contract().at(contractAddress)

        // console.log({ contract });

        const result = await contract.custodianConfirm('0x' + btcHash, amount, userTrxAddress).send({ callValue: 0 })

        console.log({ result })

    } catch (e) {
        throw e
    }
}

const checkUnwrapEvents = async () => {
    try {
        const lastFingerPrint = await db.collection(collectionNames.fingerprints).findOne({ trxAddress }, { limit: 1, sort: { createdAt: -1 } }) as FingerPrint

        // console.log({ lastFingerPrint })

        const options = { eventName: contractEvents.UnWrap, size: maxEventReturnSize, onlyConfirmed: true }

        if (lastFingerPrint) options['fingerprint'] = lastFingerPrint.fingerprint

        const results = await tronWeb.getEventResult(contractAddress, options)

        console.log({ results: results.length });

        for (const result of results) {
            // console.log({ result })

            if (result.fingerprint) await insertFingerPrintToDb(result.fingerprint)

            delete result.fingerprint

            if (result.transaction) {
                console.log({ result })

                const trxHash = result.transaction
                const userBtcAddress = result.toAddress
                const amount = result.amount

                const data = { trxHash, userBtcAddress, amount }

                const insertedId = await insertUnwrapToDb(result.transaction, result.toAddress, result.amount)

                if (insertedId) {
                    const record = await producer.send({
                        topic: KafkaConfig.topics.unwrap,
                        messages: [{
                            value: JSON.stringify(data)
                        }]
                    })
                    await db.collection(collectionNames.unwraps).updateOne({
                        _id: insertedId
                    }, {
                        $set: {
                            producer: {
                                trxAddress,
                                record,
                                data
                            },
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

export { sendWrapToContract, checkUnwrapEvents }