import { IndexSpecification } from "mongodb";

enum TrxEventProcessStatus {
    sentUnWrapEventToBtc = 'sentUnWrapEventToBtc',
    updateSuccessWrapEvent = 'updateSuccessWrapEvent',
    invalidUserBtcAddress = 'invalidUserBtcAddress',
    unknown = 'unknown'
}

type TrxEvent = {
    processed: boolean
    status: string
    raw: any
    updatedAt: Date
    createdAt: Date
}

const TrxEventIndexes: IndexSpecification[] = [
    { key: { "raw.transaction": 1 }, unique: true },
    { key: { "raw.block": 1 } },
    { key: { "raw.processed": 1 } },
]

export { TrxEvent, TrxEventIndexes, TrxEventProcessStatus }