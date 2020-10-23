import { IndexSpecification } from "mongodb"

type Unwrap = {
    processed: boolean
    trxHash: string
    trxTime: Date
    userBtcAddress: string
    userAmount: number,
    updatedAt: Date
    createdAt: Date
}

const UnwrapIndexes: IndexSpecification[] = [
    { key: { trxHash: 1 }, unique: true },
    { key: { trxTime: 1 } },
    { key: { processed: 1 } }
]

export {
    Unwrap,
    UnwrapIndexes
}