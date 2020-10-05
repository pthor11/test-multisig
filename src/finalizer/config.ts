import { config } from "dotenv";
import { networks } from "bitcoinjs-lib"

config()

if (!process.env.MONGO_URI_FINALIZER) throw new Error(`finalizer mongo uri must be provided`)
export const mongoUri = process.env.MONGO_URI_FINALIZER

if (!process.env.SEND_INTERVAL) throw new Error(`finalizer send interval must be provided`)
export const sendInterval = parseInt(process.env.SEND_INTERVAL)

if (!process.env.BTC_NETWORK) throw new Error(`btc network must be provided mainnet or testnet`)
export const network = process.env.NETWORK === 'mainnet' ? networks.bitcoin : networks.testnet

if (!process.env.BTC_MULTISIG_ADDRESS) throw new Error(`btc multisig address must be provided`)
export const multisigAddress = process.env.BTC_MULTISIG_ADDRESS

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

if (!process.env.KAFKA_CLIENT_ID_FINALIZER) throw new Error(`Kafka client id finalizer must be provided`)
if (!process.env.KAFKA_GROUP_ID_FINALIZER) throw new Error(`Kafka group id finalizer must be provided`)
if (!process.env.KAFKA_BROKERS) throw new Error(`Kafka brokers must be provided`)
if (process.env.KAFKA_MECHANISM && !process.env.KAFKA_USERNAME) throw new Error(`Kafka username must be provided with mechanism ${process.env.KAFKA_MECHANISM}`)
if (process.env.KAFKA_MECHANISM && !process.env.KAFKA_PASSWORD) throw new Error(`Kafka password must be provided with mechanism ${process.env.KAFKA_MECHANISM}`)

export const kafkaConfig = {
    clientId: process.env.KAFKA_CLIENT_ID_FINALIZER,
    groupId: process.env.KAFKA_GROUP_ID_FINALIZER,
    brokers: process.env.KAFKA_BROKERS,
    mechanism: process.env.KAFKA_MECHANISM,
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
    topic: {
        psbt: 'psbt-debug'
    }
}
