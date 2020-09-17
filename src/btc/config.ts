import { config } from "dotenv";

config()

export const multisigAddress = process.env.MULTISIG_ADDRESS
export const btcAddress = process.env.BTC_ADDRESS
export const btcPrivateKey = process.env.BTC_PRIVATEKEY
export const btcBlockbook = process.env.BTC_BLOCKBOOK