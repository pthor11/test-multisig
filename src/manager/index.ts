import { receiverAddress, receiverValue } from "./config"
import { sendTx } from "./sendTx"

const start = async () => {
    try {

        if (!receiverAddress) throw new Error(`invalid receiver address`)

        if (!receiverValue) throw new Error(`invalid receiver value`)

        await sendTx({
            receiverAddress,
            receiverValue
        })
    } catch (e) {
        throw e
    }
}

start()