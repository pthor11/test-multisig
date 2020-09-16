import { tronWeb } from "./tronweb"

const inspectOpReturnData = (hex: string): string => {
    // xoá opcode identifier 
    const subHex = hex?.substr(4) || ''

    return Buffer.from(subHex, 'hex').toString()
}


const inpectTrxAddressInOpReturnData = (hex: string): boolean => {
    const msg: string = inspectOpReturnData(hex)
    console.log({ msg });

    return tronWeb.isAddress(msg)
}

export { inpectTrxAddressInOpReturnData }