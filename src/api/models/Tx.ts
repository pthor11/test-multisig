import { IndexSpecification } from "mongodb"

enum TxType {
    wrap = 'wrap',
    unwrap = 'unwrap'
}

type Tx = {
    type: TxType
    btcHash?: string
    trxHash?: string
    btcTime?: Date
    trxTime?: Date
    btcAddress?: string
    trxAddress?: string
    value: number
    updatedAt: Date
    createdAt: Date
}

const TxIndexes: IndexSpecification[] = [
    { key: { type: 1 } },
    { key: { btcAddress: 1 }, partialFilterExpression: { btcAddress: { $exists: true } } },
    { key: { trxAddress: 1 }, partialFilterExpression: { trxAddress: { $exists: true } } },
    { key: { btcHash: 1 }, unique: true, partialFilterExpression: { $and: [{ type: { $eq: TxType.wrap } }, { btcHash: { $exists: true } }] } },
    { key: { trxHash: 1 }, unique: true, partialFilterExpression: { $and: [{ type: { $eq: TxType.unwrap } }, { trxHash: { $exists: true } }] } },
]

export {
    TxType,
    Tx,
    TxIndexes
}