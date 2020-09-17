import { config } from "dotenv";

config()

export const wrapperAddress = process.env.WRAPPER_ADDRESS
export const custodianAddress = process.env.CUSTODIAN_ADDRESS
export const custodianPrivateKey = process.env.CUSTODIAN_PRIVATEKEY

export const fullNode = process.env.FULL_NODE
export const solidityNode = process.env.SOLIDITY_NODE
export const eventServer = process.env.EVENT_SEVER