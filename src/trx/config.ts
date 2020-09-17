import { config } from "dotenv";

config()

export const mongoUri = process.env.MONGO

export const wrapperAddress = process.env.WRAPPER_ADDRESS
export const custodianAddress = process.env.CUSTODIAN_ADDRESS
export const custodianPrivateKey = process.env.CUSTODIAN_PRIVATEKEY

export const fullNodeUri = process.env.FULL_NODE
export const solidityNodeUri = process.env.SOLIDITY_NODE
export const eventServerUri = process.env.EVENT_SEVER