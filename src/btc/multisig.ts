import { callBlockbook } from "./blockbook"
import { blockbookMethods, btcAddress, KafkaConfig, multisigAddress } from "./config"
import { inspectOpReturnData } from "../util"
import { insertWrapEventToDb } from "./models/Wrap"
import { producer } from "./kafka"
import { collectionNames, db } from "./mongo"

const downloadAllTransactions = async (page: number = 1, _transactions: any[] = []): Promise<any[]> => {
    try {
        const result = await callBlockbook({
            method: blockbookMethods.address,
            data: `${multisigAddress}?details=txs&page=${page}`
        })

        // console.log({ result });

        if (result.txs === result.itemsOnPage) {
            return downloadAllTransactions(page + 1, result.txids)
        } else {
            return [...result.transactions, ..._transactions]
        }
    } catch (e) {
        throw e
    }
}

const isReceivedTransaction = (transaction: any): boolean => transaction.vin.find(input => input.isAddress && input.addresses.includes(multisigAddress)) ? false : true

const getMessageFromTransaction = (transaction: any): string | undefined => transaction.vout.find(output => !output.isAddress)?.hex



export const checkWrapEvents = async () => {
    try {
        const transactions = await downloadAllTransactions()
        for (const transaction of transactions.reverse()) {
            if (isReceivedTransaction(transaction)) {
                const userTrxAddress = inspectOpReturnData(getMessageFromTransaction(transaction) as string)

                const amount = transaction.vout.reduce((total, each) => each.isAddress && each.addresses.includes(multisigAddress) ? total + parseInt(each.value) : total, 0)

                const insertedId = await insertWrapEventToDb(transaction.txid, userTrxAddress, amount)

                if (insertedId) {
                    const data = {
                        btcHash: transaction.txid,
                        userTrxAddress,
                        amount
                    }
                    const record = await producer.send({
                        topic: KafkaConfig.topicPrefix ? KafkaConfig.topicPrefix + '.' + KafkaConfig.topics.wrap : KafkaConfig.topics.wrap,
                        messages: [{
                            value: JSON.stringify(data)
                        }]
                    })

                    await db.collection(collectionNames.wraps).updateOne({
                        _id: insertedId
                    }, {
                        $set: {
                            producer: { btcAddress, record, data },
                            updatedAt: new Date()
                        }
                    })
                }
            }
        }
    } catch (e) {
        throw e
    }
}