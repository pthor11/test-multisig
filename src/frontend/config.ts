import { config } from "dotenv";
import { networks } from "bitcoinjs-lib";

config()

if (!process.env.BTC_NETWORK || process.env.BTC_NETWORK && !['mainnet', 'testnet'].includes(process.env.BTC_NETWORK)) throw new Error(`btc network must be set mainnet or testnet`)

export const network = process.env.BTC_NETWORK === 'mainnet' ? networks.bitcoin : networks.testnet

if (!process.env.BTC_BLOCKBOOK) throw new Error(`btc api must be set`)

export const btcBlockbook = process.env.BTC_BLOCKBOOK

export const blockbookMethods = {
    tx: 'tx',
    utxo: 'utxo',
    block: 'block',
    sendtx: 'sendtx',
    address: 'address',
    estimatefee: 'estimatefee',
}

export const fullNodeUri = process.env.TRX_FULL_NODE
export const solidityNodeUri = process.env.TRX_SOLIDITY_NODE
export const eventServerUri = process.env.TRX_EVENT_SEVER