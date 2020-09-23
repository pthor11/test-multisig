import { config } from "dotenv";
import { networks } from "bitcoinjs-lib"

config()

export const mongoUri = process.env.MONGO_URI

// if (!process.env.BTC_NETWORK) throw new Error(`btc network must be provided mainnet or testnet`)
// export const network = process.env.NETWORK === 'mainnet' ? networks.bitcoin : networks.testnet

// if (!process.env.BTC_MULTISIG_ADDRESS) throw new Error(`btc multisig address must be provided`)
// export const multisigAddress = process.env.BTC_MULTISIG_ADDRESS

// if (!process.env.BTC_NODE_ADDRESS) throw new Error(`btc node address must be provided`)
// export const btcAddress = process.env.BTC_NODE_ADDRESS

// if (!process.env.BTC_NODE_PRIVATEKEY) throw new Error(`btc node privatekey must be provided`)
// export const btcPrivateKey = process.env.BTC_NODE_PRIVATEKEY

// if (!process.env.BTC_BLOCKBOOK) throw new Error(`btc blockbook must be provided`)
// export const btcBlockbook = process.env.BTC_BLOCKBOOK

// export const blockbookMethods = {
//     tx: 'tx',
//     utxo: 'utxo',
//     sendtx: 'sendtx',
//     address: 'address',
//     estimatefee: 'estimatefee',
// }

// if (!process.env.BTC_SIGNATURE_MINIMUM) throw new Error(`btc signature minimum must be provided`)
// export const signatureMinimum = parseInt(process.env.BTC_SIGNATURE_MINIMUM)

// if (!process.env.BTC_PUBLICKEYS) throw new Error(`btc publickeys must be provided`)
// export const publickeys = process.env.BTC_PUBLICKEYS.split(',')

// if (!process.env.KAFKA_BROKERS) throw new Error(`kafka brokers must be provided`)
// if (!process.env.KAFKA_BTC_CLIENT_ID) throw new Error(`kafka btc client id must be provided`)
// if (!process.env.KAFKA_BTC_GROUP_ID) throw new Error(`kafka btc group id must be provided`)

// export const KafkaConfig = {
//     brokers: process.env.KAFKA_BROKERS,
//     btcClientId: process.env.KAFKA_BTC_CLIENT_ID,
//     btcGroupId: process.env.KAFKA_BTC_GROUP_ID,
//     mechanism: process.env.KAFKA_MECHANISM,
//     username: process.env.KAFKA_USERNAME,
//     password: process.env.KAFKA_PASSWORD,
//     topicPrefix: process.env.KAFKA_TOPIC_PREFIX,
//     topics: {
//         wrap: process.env.KAFKA_TOPIC_PREFIX ? process.env.KAFKA_TOPIC_PREFIX + '.' + 'wrap' : 'wrap',
//         unwrap: process.env.KAFKA_TOPIC_PREFIX ? process.env.KAFKA_TOPIC_PREFIX + '.' + 'unwrap' : 'unwrap',
//         sign: process.env.KAFKA_TOPIC_PREFIX ? process.env.KAFKA_TOPIC_PREFIX + '.' + 'sign': 'sign'
//     }
// }