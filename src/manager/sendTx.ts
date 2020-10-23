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
            const isSegwit = txs[i].hex.substring(8, 12) === '0001'
            console.log({ txid: utxo.txid, isSegwit });

            const input: any = {
                hash: utxo.txid,
                index: utxo.vout
            }

            if (isSegwit) {
                const scriptPubkey = txs[i].vout.find(output => output.isAddress && output.addresses.includes(multisigAddress)).hex
                console.log({ scriptPubkey });

                input.witnessUtxo = {
                    script: Buffer.from(scriptPubkey, 'hex'),
                    value: parseInt(utxo.value)
                }

                input.witnessScript = payments.p2ms({
                    m: signatureMinimum,
                    pubkeys: wifs.map(wif => ECPair.fromWIF(wif, network).publicKey),
                    network
                }).output
            } else {
                input.nonWitnessUtxo = Buffer.from(txs[i].hex, 'hex')
                input.redeemScript = payments.p2ms({
                    m: signatureMinimum,
                    pubkeys: wifs.map(wif => ECPair.fromWIF(wif, network).publicKey),
                    network
                }).output
            }

            console.log({ input });

            return input
        }))

        psbt.addOutput({
            address: receiverAddress!,
            value: receiverValue
        })


        for (let i = 0; i < signatureMinimum; i++) {
            const wif = wifs[i]
            console.log({ wif });
            
            await psbt.signAllInputsAsync(ECPair.fromWIF(wif, network))
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
        console.error(e.response?.data || e)
    }
}

export { sendTx }