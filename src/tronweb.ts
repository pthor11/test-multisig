import * as TronWeb from 'tronweb'

const HttpProvider = TronWeb.providers.HttpProvider
const fullNode = new HttpProvider('https://api.shasta.trongrid.io')
const solidityNode = new HttpProvider('https://api.shasta.trongrid.io')
// const eventServer = new HttpProvider('')
// const privateKey = ''

const tronWeb = new TronWeb({
    fullNode,
    solidityNode,
    // eventServer,
    // privateKey
})

export { tronWeb }