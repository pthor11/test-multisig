import { address } from "bitcoinjs-lib"
import { WrapperEvent } from "../models/WrapperEvent"
import { UnWrapMessage } from "../models/Message.process"
import { collectionNames, db } from "../mongo"
import { TrxEventProcessStatus } from "../models/TrxEvent"
import { network } from "../config"

const isValidBtcAddress = (params: { address: string }): boolean => {
    try {
        address.toOutputScript(params.address, network)
        return true
    } catch (e) {
        return false
    }
}

const processWrapEvent = async (raw: any) => {
    try {
        const trxHash = raw.transaction
        const trxTime = raw.timestamp
        const btcHash = raw.result.txId

        await Promise.all([
            db.collection(collectionNames.wraps).updateOne({ btcHash }, {
                $set: {
                    trxHash,
                    trxTime,
                    updatedAt: new Date()
                }
            }, { upsert: true }),
            db.collection(collectionNames.trxEvents).updateOne({ "raw.transaction": raw.transaction }, {
                $set: {
                    processed: true,
                    updatedAt: new Date()
                }
            })
        ])

    } catch (e) {
        throw e
    }
}

const processUnWrapEvent = async (raw: any) => {
    try {
        console.log({ unwrap: raw });

        const trxHash = raw.transaction
        const trxTime = new Date(raw.timestamp)
        const userBtcAddress = raw.result.toAddress
        const userAmount = parseInt(raw.result.amount)

        const unwrapMessage: UnWrapMessage = {
            trxHash,
            trxTime,
            userBtcAddress,
            userAmount
        }

        if (!isValidBtcAddress({ address: userBtcAddress })) {
            await db.collection(collectionNames.trxEvents).updateOne({ "raw.transaction": raw.transaction }, {
                $set: {
                    processed: true,
                    status: TrxEventProcessStatus.errorInvalidAddress,
                    updatedAt: new Date()
                }
            })

            return false
        }

        if (userAmount <= 546) {
            await db.collection(collectionNames.trxEvents).updateOne({ "raw.transaction": raw.transaction }, {
                $set: {
                    processed: true,
                    status: TrxEventProcessStatus.errorInvalidAmount,
                    updatedAt: new Date()
                }
            })

            return false
        }

        if (!process.send) throw new Error(`process.send not found to send unwrap message`)

        process.send(unwrapMessage)

        await Promise.all([
            db.collection(collectionNames.unwraps).insertOne({
                trxHash,
                trxTime,
                userBtcAddress,
                userAmount,
                createdAt: new Date()
            }),
            db.collection(collectionNames.trxEvents).updateOne({ "raw.transaction": raw.transaction }, {
                $set: {
                    processed: true,
                    status: TrxEventProcessStatus.sentUnWrapMessageToProcessBtc,
                    updatedAt: new Date()
                }
            })
        ])
    } catch (e) {
        throw e
    }
}

const processEvent = async () => {
    try {
        const unprocessedEvent = await db.collection(collectionNames.trxEvents).findOne({ processed: false }, { sort: { "raw.block": 1 } })

        const raw = unprocessedEvent?.raw

        if (!raw) return setTimeout(processEvent, 1000)

        switch (raw.name) {
            case WrapperEvent.Wrap:
                await processWrapEvent(raw)
                break;
            case WrapperEvent.UnWrap:
                await processUnWrapEvent(raw)
                break;

            default: throw new Error(`contract event ${raw.name} is not supported`)
        }

        setTimeout(processEvent, 100)
    } catch (e) {
        setTimeout(processEvent, 1000)
        throw e
    }
}

export { processEvent }