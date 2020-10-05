import { IndexSpecification } from "mongodb";

type UnWrap = {
    processed: boolean
    trxHash: string
    btcHash?: string
    base: string
    signeds: string[]
    error?: string
    updatedAt: Date
    createdAt: Date
}

const UnWrapIndexes: IndexSpecification[] = [
    { key: { processed: 1 } },
    { key: { trxHash: 1 }, unique: true },
    { key: { btcHash: 1 }, partialFilterExpression: { btcHash: { $exists: true } }, unique: true }
]

export { UnWrap, UnWrapIndexes }