import { IndexSpecification } from "mongodb";

enum UnwrapEventProcessStatus {
    invalidBtcAddress = 'invalidBtcAddress',
    invalidAmount = 'invalidAmount',
    sentUnwrapToBtc = 'sentUnwrapToBtc',
    sentUnwrapToKafka = 'sentUnwrapToKafka',
}

type Event = {
    processed: boolean
    status: string
    raw: any
    updatedAt: Date
    createdAt: Date
}

const EventIndexes: IndexSpecification[] = [
    { key: { "raw.transaction": 1 }, unique: true },
    { key: { "raw.block": 1 } },
    { key: { "raw.processed": 1 } },
]

export {
    Event,
    EventIndexes,
    UnwrapEventProcessStatus
}