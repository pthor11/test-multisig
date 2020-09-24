import { config } from "dotenv";
import { networks } from "bitcoinjs-lib"

config()

// if (!process.env.BTC_MONGO) throw new Error(`btc mongo must be provided`)
// export const mongoUri = process.env.BTC_MONGO



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