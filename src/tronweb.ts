import * as TronWeb from 'tronweb'

const HttpProvider = TronWeb.providers.HttpProvider
const fullNode = new HttpProvider('https://api.shasta.trongrid.io')
const solidityNode = new HttpProvider('https://api.shasta.trongrid.io')
const eventServer = new HttpProvider('https://api.shasta.trongrid.io')
const privateKey = '' // Custodian 1
// const privateKey = 'D758D82B6C083DF851B3E2E5FF73C2D0326233301BEFC77CF900645517A12E2C' // Custodian 2
// const privateKey = '870736B178A9ADE7321A380717DFFE18431D8CF3EE13D573F7304C4A937CF2EB' // Custodian 3

const tronWeb = new TronWeb({
    fullNode,
    solidityNode,
    eventServer,
    privateKey
})

export { tronWeb }