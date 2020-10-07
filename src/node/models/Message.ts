type KafkaMessage = {
    trxHash: string,
    base: string,
    signed: string
}

type WrapMessage = {
    btcHash: string
    btcTime: Date
    userTrxAddress: string
    userAmount: number
}

type UnWrapMessage = {
    trxHash: string
    trxTime: Date
    userBtcAddress: string
    userAmount: number
}

export {
    KafkaMessage,
    WrapMessage,
    UnWrapMessage
}