import { IndexSpecification } from "mongodb";

type Event = {
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

export {
    Event,
    TrxEventIndexes
}