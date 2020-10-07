import { address } from "bitcoinjs-lib"
import { ActionType } from "../models/Action"
import { UnWrapMessage } from "../models/Message"
import { collectionNames, db } from "../mongo"
import { UnwrapEventProcessStatus } from "../models/Event"
import { network, wrapperAmounMinimum } from "../config"

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
        await db.collection(collectionNames.events).updateOne({ "raw.transaction": raw.transaction }, {
            $set: {
                processed: true,
                updatedAt: new Date()
            }
        })

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

        const errors: string[] = []

        if (!isValidBtcAddress) errors.push(UnwrapEventProcessStatus.invalidBtcAddress)
        if (userAmount < wrapperAmounMinimum) errors.push(UnwrapEventProcessStatus.invalidAmount)

        if (errors.length !== 0) {
            await db.collection(collectionNames.events).updateOne({
                "raw.transaction": raw.transaction
            }, {
                $set: {
                    processed: true,
                    status: errors,
                    updatedAt: new Date()
                }
            })

            return false
        }


        if (!process.send) throw new Error(`process.send not found to send unwrap message`)

        db.collection(collectionNames.events).updateOne({
            "raw.transaction": raw.transaction
        }, {
            $set: {
                processed: true,
                status: UnwrapEventProcessStatus.sentUnwrapToBtc,
                updatedAt: new Date()
            }
        })

        process.send(unwrapMessage)

        await db.collection(collectionNames.unwraps).insertOne({
            trxHash,
            trxTime,
            userBtcAddress,
            userAmount,
            createdAt: new Date()
        })
    } catch (e) {
        throw e
    }
}

const processEvent = async () => {
    try {
        const unprocessedEvent = await db.collection(collectionNames.events).findOne({
            processed: false
        }, {
            sort: { "raw.block": 1 }
        })

        const raw = unprocessedEvent?.raw

        if (!raw) return setTimeout(processEvent, 1000)

        switch (raw.name.toLowerCase()) {
            case ActionType.wrap:
                await processWrapEvent(raw)
                break;
            case ActionType.unwrap:
                await processUnWrapEvent(raw)
                break;

            default: break
        }

        setTimeout(processEvent, 100)
    } catch (e) {
        setTimeout(processEvent, 1000)
        throw e
    }
}

export { processEvent }