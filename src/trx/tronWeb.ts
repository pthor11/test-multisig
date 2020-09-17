import * as TronWeb from 'tronweb'
import { fullNodeUri, solidityNodeUri, eventServerUri, custodianPrivateKey } from "./config";

if (!fullNodeUri) throw new Error(`TRX: full node uri invalid`)
if (!solidityNodeUri) throw new Error(`TRX: solidity node uri invalid`)
if (!eventServerUri) throw new Error(`TRX: event server uri invalid`)
if (!custodianPrivateKey) throw new Error(`TRX: custodian private key must be provided`)

const HttpProvider = TronWeb.providers.HttpProvider

const fullNode = new HttpProvider(fullNodeUri)
const solidityNode = new HttpProvider(solidityNodeUri)
const eventServer = new HttpProvider(eventServerUri)

const privateKey = custodianPrivateKey

const tronWeb = new TronWeb({
    fullNode,
    solidityNode,
    eventServer,
    privateKey
})

export { tronWeb }