import { WrapMessage } from "../models/Message";
import { triggerFactoryContract } from "./factory.contract";

const processWrapMessage = async (msg: WrapMessage) => {
    try {
        if (!msg.btcHash) throw new Error(`wrap message has invalid btc hash ${msg}`)
        if (!msg.userAmount) throw new Error(`wrap message has invalid user amount ${msg}`)
        if (!msg.userTrxAddress) throw new Error(`wrap message has invalid user trx address ${msg}`)

        const trxHash = await triggerFactoryContract('write', 'custodianConfirm', ['0x' + msg.btcHash, msg.userAmount, msg.userTrxAddress])

        console.log({ trxHash })
    } catch (e) {
        console.error(`processWrapMessage: ${JSON.stringify(e)}`)
        throw e
    }
}

export {
    processWrapMessage
}