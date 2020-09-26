import { factoryContractAddress, maxEventReturnSize } from "../config"
import { WrapperEvent } from "../models/WrapperEvent"
import { collectionNames, db } from "../mongo"
import { tronWeb } from "./tronWeb"

let factoryContract: any

const getContract = async () => {
    try {
        if (!factoryContract) factoryContract = await tronWeb.contract().at(factoryContractAddress)
        return factoryContract
    } catch (e) {
        throw e
    }
}

const triggerContract = async (trigger: 'read' | 'write', functionName: string, params: any[]) => {
    try {
        const contract = await getContract()
        const result = trigger === 'read' ? await contract[`${functionName}`](...params).call() : await contract[`${functionName}`](...params).send({ calValue: 0 })
        return result
    } catch (e) {
        throw e
    }
}

const getWrapEventResults = async () => {
    try {
        const options = {
            eventName: WrapperEvent.Wrap,
            size: maxEventReturnSize
        }
        const results = await tronWeb.getEventResult(factoryContractAddress, options)

        for (const result of results) {
            const trxHash = result.transaction
            const trxTime = result.timestamp
            const btcHash = result.result.txId

            await db.collection(collectionNames.wraps).updateOne({ btcHash }, {
                $set: {
                    trxHash,
                    trxTime,
                    updatedAt: new Date()
                }
            }, { upsert: true })
        }
    } catch (e) {
        throw e
    }
}

export {
    getContract,
    triggerContract
}

getWrapEventResults().then(console.log).catch(console.error)