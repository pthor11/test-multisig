import { RecordMetadata } from "kafkajs"
import { IndexSpecification } from "mongodb"
import { custodianAddress } from "../config"
import { db } from "../mongo"

export const collectionNameUnwrapRecord = 'trx.unwrap.records'

export type UnwrapProd = {
    custodian: string
    result: any
    record: RecordMetadata[]
    createdAt: Date
}

export const UnwrapProducerIndexes: IndexSpecification[] = [
    { key: { createdAt: 1 } },
    { key: { "record.partition": 1, "record.offset": 1 }, unique: true }
]

export const insertUnwrapRecordToDb = async (result: any, record: RecordMetadata[]) => {
    try {
        await db.collection(collectionNameUnwrapRecord).insertOne({
            custodian: custodianAddress,
            result,
            record,
            createdAt: new Date()
        })

    } catch (e) {
        throw e
    }
}