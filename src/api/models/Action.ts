import { IndexSpecification } from "mongodb"

enum ActionType {
    wrap = 'wrap',
    unwrap = 'unwrap'
}

type Action = {
    type: ActionType
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

const ActionIndexes: IndexSpecification[] = [
    { key: { type: 1 } },
    { key: { btcAddress: 1 }, partialFilterExpression: { btcAddress: { $exists: true } } },
    { key: { trxAddress: 1 }, partialFilterExpression: { trxAddress: { $exists: true } } },
    { key: { btcHash: 1 }, unique: true, partialFilterExpression: { $and: [{ type: { $eq: ActionType.wrap } }, { btcHash: { $exists: true } }] } },
    { key: { trxHash: 1 }, unique: true, partialFilterExpression: { $and: [{ type: { $eq: ActionType.unwrap } }, { trxHash: { $exists: true } }] } },
]

export {
    Action,
    ActionType,
    ActionIndexes
}