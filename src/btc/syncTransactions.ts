import { connectDb, db } from "../mongo"
import { callBlockbook } from "./blockbook"
import { TxType } from "../models/TxType"
import { blockbookMethods, multisigAddress } from "./config"


const downloadTransactions = async (page: number = 1, _transactions: any[] = []): Promise<any[]> => {
    try {
        const data = `${multisigAddress}?details=txs&page=${page}&pageSize=10`
        console.log({ data });

        const [resultPage, lastTx] = await Promise.all([
            callBlockbook({
                method: blockbookMethods.address,
                data
            }),
            db.collection(`btc-txs`).findOne({}, { sort: { "tx.blockHeight": -1 } })
        ])

        console.log({ resultPage, lastTx });

        if ((lastTx && resultPage.transactions.find(tx => tx.txid === lastTx.tx.txid)) || (!lastTx && page === resultPage.totalPages)) return [...resultPage.transactions, ..._transactions].reverse()

        return downloadTransactions(page + 1, [...resultPage.transactions, ..._transactions])
    } catch (e) {
        throw e
    }
}

const getBtcTxType = (tx: any): TxType => tx.vin.find(input => input.isAddress && input.addresses.includes(multisigAddress)) ? TxType.unwrap : TxType.wrap

const syncTransactions = async () => {
    try {
        const transactions = await downloadTransactions()
        console.log({ transactions: transactions.length })

        for (const tx of transactions.reverse()) {
            const type = getBtcTxType(tx)

            await db.collection(`btc-txs`).insertOne({
                type,
                tx,
                createdAt: new Date()
            })

            if (type === TxType.wrap) {
                // insert wrap document
                const userTrxAddress = ''
                const amount = ''
                await db.collection('wraps').insertOne({
                    btcHash: tx.txid,
                    userTrxAddress,
                    amount
                })
                // send message to trx process via parent process

                if (process.send) process.send({ tx })

            } else {
                // update unwrap document status: successfully received
            }

            // if (isReceivedTransaction(transaction)) {
            //     const userTrxAddress = inspectOpReturnData(getMessageFromTransaction(transaction) as string)

            //     const amount = transaction.vout.reduce((total, each) => each.isAddress && each.addresses.includes(multisigAddress) ? total + parseInt(each.value) : total, 0)

            //     const insertedId = await insertWrapEventToDb(transaction.txid, userTrxAddress, amount)

            //     if (insertedId) {
            //         const data = {
            //             btcHash: transaction.txid,
            //             userTrxAddress,
            //             amount
            //         }
            //         const record = await producer.send({
            //             topic: KafkaConfig.topicPrefix ? KafkaConfig.topicPrefix + '.' + KafkaConfig.topics.wrap : KafkaConfig.topics.wrap,
            //             messages: [{
            //                 value: JSON.stringify(data)
            //             }]
            //         })

            //         await db.collection(collectionNames.wraps).updateOne({
            //             _id: insertedId
            //         }, {
            //             $set: {
            //                 producer: { btcAddress, record, data },
            //                 updatedAt: new Date()
            //             }
            //         })
            //     }
            // }
        }
    } catch (e) {
        throw e
    }
}

export { syncTransactions }
