import { collectionNames, db } from "../mongo"
import { callBlockbook } from "./blockbook"
import { blockbookMethods, multisigAddress } from "../config"
import { Coin } from "../models/Coin"
import { Sync } from "../models/Sync"


const downloadAllTxs = async (page: number = 1, _transactions: any[] = []): Promise<any[]> => {
    try {
        let data = `${multisigAddress}?details=txs&page=${page}&pageSize=10`

        // console.log({ data });

        const address = await callBlockbook({
            method: blockbookMethods.address,
            data
        })

        const transactions = address.transactions ? address.transactions : []

        return page === address.totalPages ? [..._transactions, ...transactions] : downloadAllTxs(page + 1, [..._transactions, ...transactions])
    } catch (e) {
        throw e
    }
}

const downloadBlock = async (blockHeight: number, page: number = 1, _txs: any[] = []) => {
    try {
        const block = await callBlockbook({
            method: blockbookMethods.block,
            data: `${blockHeight}`
        })

        const { txs, totalPages } = block

        if (page === totalPages) return [...txs, ..._txs]

        return downloadBlock(blockHeight, page + 1, [...txs, ..._txs])
    } catch (e) {
        if (e.response?.status === 400 && e.response?.data?.error === 'Block not found, Block not found') return []
        throw e
    }
}


const syncBtcBlocks = async () => {
    try {
        const sync = await db.collection(collectionNames.syncs).findOne({ coin: Coin.btc }) as Sync

        console.log({ sync })

        const nextHeight = sync ? sync.height + 1 : undefined

        console.log({ nextHeight })

        const txs = nextHeight ? await downloadBlock(nextHeight) : await downloadAllTxs()

        const btcTxs = txs.reduce((txs, tx) => tx.vin.find(input => input.isAddress && input.addresses.includes(multisigAddress)) || (tx.vout.find(output => output.isAddress && output.addresses.includes(multisigAddress))) ? [...txs, {
            processed: false,
            raw: tx,
            createdAt: new Date()
        }] : txs, [])

        console.log({ btcTxs: btcTxs.length })

        if (btcTxs.length > 0) {
            await Promise.all([
                db.collection(collectionNames.btcTxs).insertMany(btcTxs),
                db.collection(collectionNames.syncs).updateOne({
                    coin: Coin.btc
                }, {
                    $set: {
                        height: nextHeight || btcTxs[0].raw.blockHeight,
                        updatedAt: new Date()
                    }
                }, { upsert: true })
            ])
        } else {
            await db.collection(collectionNames.syncs).updateOne({
                coin: Coin.btc
            }, {
                $set: {
                    height: nextHeight || btcTxs[0].raw.blockHeight,
                    updatedAt: new Date()
                }
            }, { upsert: true })
        }

        setTimeout(syncBtcBlocks, 1000)
    } catch (e) {
        setTimeout(syncBtcBlocks, 1000)
        throw e
    }
}

export { syncBtcBlocks }