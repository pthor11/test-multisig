import { config } from "dotenv";
import { networks } from "bitcoinjs-lib"

config()

export const mongoUri = process.env.MONGO_URI

if (!process.env.BTC_NETWORK) throw new Error(`btc network must be provided mainnet or testnet`)
export const network = process.env.NETWORK === 'mainnet' ? networks.bitcoin : networks.testnet

if (!process.env.BTC_MULTISIG_ADDRESS) throw new Error(`btc multisig address must be provided`)
export const multisigAddress = process.env.BTC_MULTISIG_ADDRESS

if (!process.env.BTC_NODE_ADDRESS) throw new Error(`btc node address must be provided`)
export const btcAddress = process.env.BTC_NODE_ADDRESS

if (!process.env.BTC_NODE_PRIVATEKEY) throw new Error(`btc node privatekey must be provided`)
export const btcPrivateKey = process.env.BTC_NODE_PRIVATEKEY

if (!process.env.BTC_BLOCKBOOK) throw new Error(`btc blockbook must be provided`)
export const btcBlockbook = process.env.BTC_BLOCKBOOK

export const blockbookMethods = {
    tx: 'tx',
    utxo: 'utxo',
    block: 'block',
    sendtx: 'sendtx',
    address: 'address',
    estimatefee: 'estimatefee',
}

if (!process.env.BTC_SIGNATURE_MINIMUM) throw new Error(`btc signature minimum must be provided`)
export const signatureMinimum = parseInt(process.env.BTC_SIGNATURE_MINIMUM)

if (!process.env.BTC_PUBLICKEYS) throw new Error(`btc publickeys must be provided`)
export const publickeys = process.env.BTC_PUBLICKEYS.split(',')

export const factoryContractAddress = process.env.TRX_FACTORY_ADDRESS
export const trxAddress = process.env.TRX_NODE_ADDRESS
export const trxPrivateKey = process.env.TRX_NODE_PRIVATEKEY

export const fullNodeUri = process.env.TRX_FULL_NODE
export const solidityNodeUri = process.env.TRX_SOLIDITY_NODE
export const eventServerUri = process.env.TRX_EVENT_SEVER

export const contractEvents = {
    Wrap: 'Wrap',
    UnWrap: 'UnWrap'
}
export const maxEventReturnSize = 2 //200

export const eventRequestInterval = 10000
