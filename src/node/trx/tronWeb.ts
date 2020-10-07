import TronWeb from 'tronweb'
import { fullNodeUri, solidityNodeUri, eventServerUri, trxPrivateKey } from "../config";

if (!fullNodeUri) throw new Error(`TRX: full node uri invalid`)
if (!solidityNodeUri) throw new Error(`TRX: solidity node uri invalid`)
if (!eventServerUri) throw new Error(`TRX: event server uri invalid`)
if (!trxPrivateKey) throw new Error(`TRX: custodian private key must be provided`)

const HttpProvider = TronWeb.providers.HttpProvider

const fullNode = new HttpProvider(fullNodeUri)
const solidityNode = new HttpProvider(solidityNodeUri)
const eventServer = new HttpProvider(eventServerUri)

const tronWeb = new TronWeb({
    fullNode,
    solidityNode,
    eventServer,
    privateKey: trxPrivateKey
})

export { tronWeb }