import { IndexSpecification } from "mongodb";

enum TrxEventProcessStatus {
    sentUnWrapMessageToProcessBtc = 'sentUnWrapMessageToBtcProcess',
    sentSignedPsbtToKafka = 'sentSignedPsbtToKafka',
    errorInvalidAddress = 'errorInvalidAddress',
    errorInvalidAmount = 'errorInvalidAmount',
    success = 'success'
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