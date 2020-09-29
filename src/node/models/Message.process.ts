type WrapMessage = {
    btcHash: string
    userTrxAddress: string
    userAmount: number
}

type UnWrapMessage = {
    trxHash: string
    userBtcAddress: string
    userAmount: number
}

export {
    WrapMessage,
    UnWrapMessage
}