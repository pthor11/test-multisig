import { existsSync } from "fs";
import { config } from "dotenv";
import { networks } from "bitcoinjs-lib"

import { join } from "path";

const path = join(__dirname, `../../.manager.env`)

if (existsSync(path)) {
    config({ path })
} else {
    config()
}

if (!process.env.NETWORK) throw new Error(`network must be provided mainnet or testnet`)
export const network = process.env.NETWORK === 'mainnet' ? networks.bitcoin : networks.testnet

if (!process.env.SIGNATURE_MINIMUM) throw new Error(`signature minimum must be provided`)
export const signatureMinimum = parseInt(process.env.SIGNATURE_MINIMUM)

if (!process.env.WIFS) throw new Error(`wifs must be provided`)
export const wifs = process.env.WIFS.split(',')

if (!process.env.BLOCKBOOK_API) throw new Error(`blockbook api must be provided`)
export const blockbookApi = process.env.BLOCKBOOK_API

export const receiverAddress = process.env.RECEIVER_ADDRESS
export const receiverValue = parseInt(process.env.RECEIVER_VALUE || '0')