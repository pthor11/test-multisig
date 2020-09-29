import { collectionNames, db } from "../mongo"
import { callBlockbook } from "./blockbook"
import { blockbookMethods, multisigAddress } from "../config"

const getAllTxs = async (page: number = 1, _transactions: any[] = []): Promise<any[]> => {
    try {
        const data = `${multisigAddress}?details=txs&page=${page}&pageSize=10`

        // console.log({ data });

        const address = await callBlockbook({
            method: blockbookMethods.address,
            data
        })

        const transactions = address.transactions ? address.transactions : []

        return page === address.totalPages ? [..._transactions, ...transactions] : getAllTxs(page + 1, [..._transactions, ...transactions])
    } catch (e) {
        throw e
    }
}

const updateTxs = async (page: number = 1, _transactions: any[] = [], refTx?: any) => {
    try {
        // console.log({ refTx, page })

        if (!refTx) refTx = await db.collection(collectionNames.btcTxs).findOne({}, { sort: { "raw.blockHeight": -1 }, limit: 1 })

        // console.log({ refTx })

        const data = `${multisigAddress}?details=txs&page=${page}&pageSize=10`

        const address = await callBlockbook({
            method: blockbookMethods.address,
            data
        })

        const transactions = address.transactions || []

        const txs = [..._transactions, ...transactions]

        return txs.some(tx => tx.txid === refTx.raw.txid) ? txs.filter(tx => tx.blockHeight > refTx.raw.blockHeight) : updateTxs(page + 1, txs, refTx)
    } catch (e) {
        throw e
    }
}

const syncTxs = async () => {
    try {
        const count = await db.collection(collectionNames.btcTxs).estimatedDocumentCount()
        const txs = count ? await updateTxs() : await getAllTxs()

        if (txs.length > 0) await db.collection(collectionNames.btcTxs).insertMany(txs.map(tx => {
            return {
                processed: false,
                raw: tx,
                createdAt: new Date()
            }
        }))

        setTimeout(syncTxs, 1000)
    } catch (e) {
        setTimeout(syncTxs, 1000)
        throw e
    }
}

export { syncTxs }