import { IndexSpecification } from "mongodb"

type Sync = {
    coin: string
    height: number,
    updatedAt: Date
}

const SyncIndexes: IndexSpecification[] = [
    { key: { updatedAt: 1 } }
]

export {
    Sync,
    SyncIndexes
}