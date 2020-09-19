import { config } from "dotenv";

config()

export const mongoUri = process.env.MONGO

export const wrapperAddress = process.env.WRAPPER_ADDRESS
export const custodianAddress = process.env.CUSTODIAN_ADDRESS
export const custodianPrivateKey = process.env.CUSTODIAN_PRIVATEKEY

export const fullNodeUri = process.env.FULL_NODE
export const solidityNodeUri = process.env.SOLIDITY_NODE
export const eventServerUri = process.env.EVENT_SEVER

export const unwrapEventName = 'UnWrap'
export const maxEventReturnSize = 100
export const eventRequestInterval = 10000

export const KafkaConfig = {
    brokers: process.env.KAFKA_BROKERS,
    trxClientId: process.env.KAFKA_TRX_CLIENT_ID,
    mechanism: process.env.KAFKA_MECHANISM,
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
    topicPrefix: process.env.KAFKA_TOPIC_PREFIX,
    topics: {
        wrap: 'wrap',
        unwrap: 'unwrap'
    }
}