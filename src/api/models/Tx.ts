import { IndexSpecification } from "mongodb";

type Tx = {
    processed: boolean
    status: string
    raw: any
    updatedAt: Date
    createdAt: Date
}

enum TxProcessStatus {
    invalidTrxAddress = 'invalidTrxAddress',
    valid = 'valid'
}

const TxIndexes: IndexSpecification[] = [
    { key: { "raw.txid": 1 }, unique: true },
    { key: { "raw.blockHeight": 1 } },
    { key: { "raw.processed": 1 } },
]

export {
    Tx,
    TxIndexes,
    TxProcessStatus
}