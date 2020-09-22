import { config } from "dotenv";

config()

export const mongoUri = process.env.TRX_MONGO

export const contractAddress = process.env.TRX_CONTRACT_ADDRESS
export const trxAddress = process.env.TRX_NODE_ADDRESS
export const trxPrivateKey = process.env.TRX_NODE_PRIVATEKEY

export const fullNodeUri = process.env.TRX_FULL_NODE
export const solidityNodeUri = process.env.TRX_SOLIDITY_NODE
export const eventServerUri = process.env.TRX_EVENT_SEVER

export const contractEvents = {
    Wrap: 'Wrap',
    UnWrap: 'UnWrap'
}
export const maxEventReturnSize = 100

export const eventRequestInterval = 10000

export const KafkaConfig = {
    brokers: process.env.KAFKA_BROKERS,
    trxClientId: process.env.KAFKA_TRX_CLIENT_ID,
    trxGroupId: process.env.KAFKA_TRX_GROUP_ID,
    mechanism: process.env.KAFKA_MECHANISM,
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
    topicPrefix: process.env.KAFKA_TOPIC_PREFIX,
    topics: {
        wrap: process.env.KAFKA_TOPIC_PREFIX ? process.env.KAFKA_TOPIC_PREFIX + '.' + 'wrap' : 'wrap',
        unwrap: process.env.KAFKA_TOPIC_PREFIX ? process.env.KAFKA_TOPIC_PREFIX + '.' + 'unwrap' : 'unwrap'
    }
}