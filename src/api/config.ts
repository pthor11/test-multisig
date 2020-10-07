import { existsSync } from "fs";
import { config } from "dotenv";
import { join } from "path";

const path = join(__dirname, `../../.api.env`)

if (existsSync(path)) {
    config({ path })
} else {
    config()
}

if (!process.env.PORT) throw new Error(`port must be provided`)
export const port = parseInt(process.env.PORT)

if (!process.env.MONGO_URI) throw new Error(`mongo uri must be provided`)
export const mongoUri = process.env.MONGO_URI

if (!process.env.BTC_MULTISIG_ADDRESS) throw new Error(`btc multisig address must be provided`)
export const multisigAddress = process.env.BTC_MULTISIG_ADDRESS

if (!process.env.BTC_BLOCKBOOK) throw new Error(`btc blockbook must be provided`)
export const btcBlockbook = process.env.BTC_BLOCKBOOK

export const blockbookMethods = {
    tx: 'tx',
    utxo: 'utxo',
    block: 'block',
    sendtx: 'sendtx',
    address: 'address',
    estimatefee: 'estimatefee',
}

if (!process.env.TRX_FACTORY_ADDRESS) throw new Error(`trx factory contract address must be provided`)
export const factoryContractAddress = process.env.TRX_FACTORY_ADDRESS

if(!process.env.TRX_FULL_HOST) throw new Error(`trx full host must be provided`)
export const fullHost = process.env.TRX_FULL_HOST

export const maxEventReturnSize = 2 //200

export const eventRequestInterval = 10000