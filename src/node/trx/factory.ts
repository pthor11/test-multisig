import { factoryContractAddress, maxEventReturnSize } from "../config"
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

export {
    getFactoryContract,
    triggerFactoryContract,
    getFactoryContractEventResults
}