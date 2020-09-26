import { factoryContractAddress } from "../config"
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

export {
    getContract,
    triggerContract
}