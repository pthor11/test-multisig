import { callBlockbook } from "./blockbook"
import { blockbookMethods, multisigAddress } from "./config"
import { inspectOpReturnData, inspectTrxAddressInOpReturnData } from "../util"

export const getAllTransactions = async (page: number = 1, _transactions: any[] = []): Promise<any[]> => {
    try {
        const result = await callBlockbook({
            method: blockbookMethods.address,
            data: `${multisigAddress}?details=txs&page=${page}`
        })

        // console.log({ result });

        if (result.txs === result.itemsOnPage) {
            return getAllTransactions(page + 1, result.txids)
        } else {
            return [...result.transactions, ..._transactions]
        }
    } catch (e) {
        throw e
    }
}

const isReceivedTransaction = (transaction: any): boolean => transaction.vin.find(input => input.isAddress && input.addresses.includes(multisigAddress)) ? false : true

const getMessageFromTransaction = (transaction: any): string | undefined => transaction.vout.find(output => !output.isAddress)?.hex

getAllTransactions().then(transactions => transactions.forEach(transaction => console.log({ transaction, isReceivedTransaction: isReceivedTransaction(transaction), trxAddress: isReceivedTransaction(transaction) ?  inspectOpReturnData(getMessageFromTransaction(transaction) as string) : null })))