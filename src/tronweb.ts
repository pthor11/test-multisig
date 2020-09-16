import * as TronWeb from 'tronweb'

const HttpProvider = TronWeb.providers.HttpProvider
const fullNode = new HttpProvider('https://api.shasta.trongrid.io')
const solidityNode = new HttpProvider('https://api.shasta.trongrid.io')
// const eventServer = new HttpProvider('')
const privateKey = '319DD977890568EC1E60CF5417EEDAB00F908764FF14C10524CB4ECB1C7AAEE1' // Custodian 1

const tronWeb = new TronWeb({
    fullNode,
    solidityNode,
    // eventServer,
    privateKey
})

export { tronWeb }