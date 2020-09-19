export const psbts: {
    [transaction: string]: {
        txId?: string,
        baseHex: string,
        signedHexs: string[]
    }
} = Object.create(null)