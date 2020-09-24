import { IndexSpecification } from "mongodb";

enum BtcTxProcessStatus {
    sentWrapEventToTrx = 'sentWrapEventToTrx',
    updateSuccessUnwrapEvent = 'updateSuccessUnwrapEvent',
    invalidUserTrxAddress = 'invalidUserTrxAddress',
    unknown = 'unknown'
}

type BtcTx = {
    processed: boolean
    status: string
    raw: any
    updatedAt: Date
    createdAt: Date
}

const BtcTxIndexes: IndexSpecification[] = [
    { key: { "raw.txid": 1 }, unique: true },
    { key: { "raw.blockHeight": 1 } },
    { key: { "raw.processed": 1 } },
]

export { BtcTx, BtcTxIndexes, BtcTxProcessStatus }