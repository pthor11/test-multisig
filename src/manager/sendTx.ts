import Axios from "axios";
import axios from "axios";
import { ECPair, payments, Psbt } from "bitcoinjs-lib";
import { blockbookApi, receiverAddress, receiverValue, network, signatureMinimum, wifs } from "./config";
import { multisigAddress } from "./multisig";

type Utxo = {
    txid: string
    vout: number
    value: string
    height: number
    confirmations: number
}

const getDetailTxs = async (hashes: string[]): Promise<any[]> => {
    try {
        const responses = await Promise.all(hashes.map(hash => Axios.get(`${blockbookApi}/tx/${hash}`)))

        return responses.map(response => response.data)
    } catch (e) {
        throw e
    }
}

const sendTx = async (params: { receiverAddress: string, receiverValue: number }) => {
    try {
        console.log({ params });

        if (!receiverAddress) {
            console.error(`invalid receiver address`);
            process.exit(1)
        }

        if (receiverValue <= 0) {
            console.error(`invalid receiver value`);
            process.exit(1)
        }

        const utxosResponse = await axios.get(`${blockbookApi}/utxo/${multisigAddress}`)

        let utxos = utxosResponse.data as Utxo[]

        utxos = utxos.filter(utxo => utxo.confirmations > 0)

        console.log({ utxos });

        const txs = await getDetailTxs(utxos.map(utxos => utxos.txid))

        console.log({ txs });

        const psbt = new Psbt({ network })

        psbt.addInputs(utxos.map((utxo, i) => {
            return {
                hash: utxo.txid,
                index: utxo.vout,
                nonWitnessUtxo: Buffer.from(txs[i].hex, 'hex'),
                redeemScript: payments.p2ms({
                    m: signatureMinimum,
                    pubkeys: wifs.map(wif => ECPair.fromWIF(wif, network).publicKey),
                    network
                }).output
            }
        }))

        psbt.addOutput({
            address: receiverAddress!,
            value: receiverValue
        })

        for (let i = 0; i < signatureMinimum; i++) {
            await psbt.signAllInputsAsync(ECPair.fromWIF(wifs[i], network))
        }

        psbt.finalizeAllInputs()

        const txRawHex = psbt.extractTransaction().toHex()

        console.log({ txRawHex });

        // const sendResponse = await Axios.get(`${blockbookApi}/sendtx/${txRawHex}`)
        
        const sendResponse = await Axios.post(`${blockbookApi}/sendtx/`, txRawHex)

        const txid = sendResponse.data

        console.log({ txid });

        return txid
    } catch (e) {
        console.error(e.response.data || e)
    }
}

export { sendTx }