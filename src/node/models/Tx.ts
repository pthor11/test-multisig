import { IndexSpecification } from "mongodb";

enum WrapTxProcessStatus {
    invalidTrxAddress = 'invalidTrxAddress',
    invalidAmount = 'invalidAmount',
    sentWrapToTrx = 'sentWrapToTrx',
    sentWrapToContract = 'sentWrapToContract'
}

type Tx = {
    processed: boolean
    status: string
    raw: any
    type: string,
    updatedAt: Date
    createdAt: Date
}

const TxIndexes: IndexSpecification[] = [
    { key: { "raw.txid": 1 }, unique: true },
    { key: { "raw.blockHeight": 1 } },
    { key: { processed: 1 } },
    { key: { type: 1 } },
]

export {
    Tx,
    TxIndexes,
    WrapTxProcessStatus
}