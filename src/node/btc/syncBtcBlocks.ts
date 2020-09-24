import { collectionNames, connectDb, db } from "../mongo"
import { callBlockbook } from "./blockbook"
import { blockbookMethods, multisigAddress } from "../config"
import { BtcTx } from "../models/BtcTx"


const downloadTxs = async (from?: number, to?: number, page: number = 1, _transactions: any[] = []): Promise<any[]> => {
    try {
        let data = `${multisigAddress}?details=txs&page=${page}&pageSize=10`

        if (from) data += `&from=${from}`
        if (to) data += `&to=${to}`

        // console.log({ data });

        const address = await callBlockbook({
            method: blockbookMethods.address,
            data
        })

        const transactions = address.transactions ? address.transactions : []

        if (page !== address.totalPages) return downloadTxs(from, to, page + 1, [...transactions, ..._transactions])

        return [...transactions, ..._transactions].reverse()

    } catch (e) {
        throw e
    }
}


const syncBtcBlocks = async () => {
    try {
        const lastTx = await db.collection(collectionNames.btcTxs).findOne({}, { sort: { "raw.blockHeight": -1 }, projection: { _id: false, "raw.blockHeight": true } }) as BtcTx

        console.log({ lastTx })

        const fromBlock = lastTx?.raw?.blockHeight ? lastTx.raw.blockHeight + 1 : undefined
        const toBlock = fromBlock ? fromBlock + 50 : undefined

        // console.log({ fromBlock, toBlock })

        const txs = await downloadTxs(fromBlock, toBlock)

        const btcTxs = txs.map(tx => {
            return {
                processed: false,
                raw: tx,
                createdAt: new Date()
            }
        })

        if (btcTxs.length > 0) await db.collection(collectionNames.btcTxs).insertMany(btcTxs)

        setTimeout(syncBtcBlocks, 50000)
    } catch (e) {
        setTimeout(syncBtcBlocks, 50000)
        throw e
    }
}

export { syncBtcBlocks }
