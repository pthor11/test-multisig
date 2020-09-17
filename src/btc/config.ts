import { config } from "dotenv";

config()

export const multisigAddress = process.env.MULTISIG_ADDRESS
export const btcAddress = process.env.BTC_ADDRESS
export const btcPrivateKey = process.env.BTC_PRIVATEKEY
export const btcBlockbook = process.env.BTC_BLOCKBOOK

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