import { config } from "dotenv";
import { networks} from "bitcoinjs-lib"

config()

export const mongoUri = process.env.MONGO

if (!process.env.NETWORK) throw new Error(`btc network must be provided mainnet or testnet`)
export const network = process.env.NETWORK === 'mainnet' ? networks.bitcoin : networks.testnet

if (!process.env.MULTISIG_ADDRESS) throw new Error(`btc multisig address must be provided`)
export const multisigAddress = process.env.MULTISIG_ADDRESS

if (!process.env.BTC_ADDRESS) throw new Error(`btc address must be provided`)
export const btcAddress = process.env.BTC_ADDRESS

if (!process.env.BTC_PRIVATEKEY) throw new Error(`btc privatekey must be provided`)
export const btcPrivateKey = process.env.BTC_PRIVATEKEY

if (!process.env.BTC_BLOCKBOOK) throw new Error(`btc blockbook must be provided`)
export const btcBlockbook = process.env.BTC_BLOCKBOOK

export const blockbookMethods = {
    tx: 'tx',
    utxo: 'utxo',
    sendtx: 'sendtx',
    estimatefee: 'estimatefee',
}

if (!process.env.BTC_SIGNATURE_MINIMUM) throw new Error(`btc signature minimum must be provided`)
export const signatureMinimum = parseInt(process.env.BTC_SIGNATURE_MINIMUM)

if (!process.env.BTC_PUBLICKEYS) throw new Error(`btc publickeys must be provided`)
export const publickeys = process.env.BTC_PUBLICKEYS.split(',')

export const KafkaConfig = {
    brokers: process.env.KAFKA_BROKERS,
    btcClientId: process.env.KAFKA_BTC_CLIENT_ID,
    btcGroupId: process.env.KAFKA_BTC_GROUP_ID,
    mechanism: process.env.KAFKA_MECHANISM,
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
    topicPrefix: process.env.KAFKA_TOPIC_PREFIX,
    topics: {
        wrap: 'wrap',
        unwrap: 'unwrap'
    }
}