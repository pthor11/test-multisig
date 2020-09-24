import { IndexSpecification } from "mongodb"

type Wrap = {
    btcHash: string
    btcTime: Date
    userTrxAddress: string
    userAmount: number
    trxHash?: number
    trxTime?: Date
    updatedAt: Date
    createdAt: Date
}

const WrapIndexes: IndexSpecification[] = [
    { key: { btcHash: 1 }, unique: true }
]

export {
    Wrap,
    WrapIndexes
}