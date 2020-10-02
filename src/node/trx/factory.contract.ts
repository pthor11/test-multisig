import { factoryContractAddress, maxEventReturnSize } from "../config"
import { WrapperEvent } from "../models/WrapperEvent"
import { collectionNames, db } from "../mongo"
import { tronWeb } from "./tronWeb"

let factoryContract: any

const getFactoryContract = async () => {
    try {
        if (!factoryContract) factoryContract = await tronWeb.contract().at(factoryContractAddress)
        return factoryContract
    } catch (e) {
        throw e
    }
}

const triggerFactoryContract = async (trigger: 'read' | 'write', functionName: string, params: any[]) => {
    try {
        const contract = await getFactoryContract()
        const result = trigger === 'read' ? await contract[`${functionName}`](...params).call() : await contract[`${functionName}`](...params).send({ calValue: 0 })
        return result
    } catch (e) {
        throw e
    }
}

const getFactoryContractEventResults = async (fingerprint?: string) => {
    try {
        const options: {
            fingerprint?: string,
            size: number
        } = { size: maxEventReturnSize }

        if (fingerprint) options.fingerprint = fingerprint

        const results = await tronWeb.getEventResult(factoryContractAddress, options)

        return results
    } catch (e) {
        throw e
    }
}

const syncTrxEventResults = async (wrapEventHandler?: (result) => Promise<void>, unwrapEventHandler?: (result) => Promise<void>) => {
    try {
        const results = await getFactoryContractEventResults()

        console.log(results)

        let shouldContinueDownloadEventResults: boolean = false
        let fingerprint: string

        for (const result of results) {
            const name = result.name

            console.log({ name, result })

            if (result.fingerprint) fingerprint = result.fingerprint

            switch (name) {
                case WrapperEvent.Wrap:
                    const { upsertedId } = await db.collection(collectionNames.wraps).updateOne({ btcHash: result.result.txId }, {
                        $set: {
                            trxHash: result.transaction,
                            trxTime: result.timestamp,
                            updatedAt: new Date()
                        }
                    }, { upsert: true })

                    if (!upsertedId) shouldContinueDownloadEventResults = true

                    if (wrapEventHandler) await wrapEventHandler(result)
                    break;

                case WrapperEvent.UnWrap:
                    if (unwrapEventHandler) await unwrapEventHandler(result)
                    break

                default: throw new Error(`factory contract event ${name} is not supported`)
            }
        }

    
    } catch (e) {
        throw e
    }
}

export {
    getFactoryContract,
    triggerFactoryContract,
    getFactoryContractEventResults
}