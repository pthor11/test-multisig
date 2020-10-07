import { existsSync } from "fs";
import { config } from "dotenv";
import { networks } from "bitcoinjs-lib"

import { join } from "path";

const path = join(__dirname, `../../.node.env`)

if (existsSync(path)) {
    config({ path })
} else {
    config()
}

if (!process.env.WRAPPER_AMOUNT_MINIMUM) throw new Error(`wrapper amount minimum must be provided`)
export const wrapperAmounMinimum = parseInt(process.env.WRAPPER_AMOUNT_MINIMUM)

if (!process.env.MONGO_URI_NODE) throw new Error(`mongo uri node must be provided`)
export const mongoUri = process.env.MONGO_URI_NODE

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
export const maxEventReturnSize = 200

export const eventRequestInterval = 10000

if (!process.env.KAFKA_CLIENT_ID_NODE) throw new Error(`Kafka client id node must be provided`)
if (!process.env.KAFKA_TOPIC_PSBT) throw new Error(`Kafka topic psbt must be provided`)
if (!process.env.KAFKA_BROKERS) throw new Error(`Kafka brokers must be provided`)
if (process.env.KAFKA_MECHANISM && !process.env.KAFKA_USERNAME) throw new Error(`Kafka username must be provided with mechanism ${process.env.KAFKA_MECHANISM}`)
if (process.env.KAFKA_MECHANISM && !process.env.KAFKA_PASSWORD) throw new Error(`Kafka password must be provided with mechanism ${process.env.KAFKA_MECHANISM}`)

export const kafkaConfig = {
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: process.env.KAFKA_BROKERS,
    mechanism: process.env.KAFKA_MECHANISM,
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
    topic: {
        psbt: process.env.KAFKA_TOPIC_PSBT
    }
}
