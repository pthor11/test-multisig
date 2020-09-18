import { collectionNames, db } from "./mongo"
import * as coinSelect from "coinselect";
import { payments, Psbt, address, ECPair } from "bitcoinjs-lib";
import { blockbookMethods, btcPrivateKey, multisigAddress, network, publickeys, signatureMinimum } from "./config";
import { callBlockbook } from "./blockbook";

export const consumeUnwrapEvent = async (data: any) => {
    try {
        console.log({ data })

        const transaction = data.result?.transaction
        const toAddress = data.result?.toAddress
        const amount = Number(data.result?.amount)

        if (!transaction) throw new Error(`consumer received unwrap message with no transaction`)

        if (!Number.isInteger(amount)) throw new Error(`consumer received unwrap message with invalid amount ${amount}`)

        if (!address.toOutputScript(toAddress, network)) throw new Error(`consumer received unwrap message with invalid address ${amount} for network ${network}`)

        const { inputs, outputs, fee } = await selectUtxos(toAddress, amount)

        console.log({ inputs, outputs, fee })

        const transactions: any[] = await Promise.all(inputs.map(input => input.txid))

        const psbt = new Psbt({ network })

        for (let i = 0; i < inputs.length; i++) {
            psbt.addInput({
                hash: inputs[i].txId,
                index: inputs[i].vout,
                nonWitnessUtxo: Buffer.from(transactions[i].hex, 'hex'),
                redeemScript: payments.p2ms({
                    m: signatureMinimum,
                    pubkeys: publickeys.map(publickey => Buffer.from(publickey, 'hex')),
                    network
                }).output
            })
        }

        for (let i = 0; i < outputs.length; i++) {
            psbt.addOutput({
                address: outputs[i].address || multisigAddress,
                value: outputs[i].value
            })
        }

        await psbt.signAllInputsAsync(ECPair.fromWIF(btcPrivateKey, network))

        const signedPsbtHex = psbt.toBase64()

        // send signedPsbtHex to Kafka
    } catch (e) {
        throw e
    }
}

const getUtxos = async (address: string): Promise<any[]> => {
    try {
        const utxos = await callBlockbook({ method: blockbookMethods.utxo, data: address })

        return utxos
    } catch (e) {
        throw e
    }
}

const getFeeRate = async () => {
    try {
        const result = await callBlockbook({ method: blockbookMethods.estimatefee, data: 2 })

        const feeRateKilobytePerSatoshi = Number(result?.result)

        if (!feeRateKilobytePerSatoshi) throw new Error(`estimate feerate from blockbook is invalid ${result?.result}`)

        return feeRateKilobytePerSatoshi * (10 ** 5)
    } catch (e) {
        throw e
    }
}

const selectUtxos = async (address: string, value: number) => {
    try {
        let utxos: any[] = await getUtxos(address)

        utxos = utxos.map(utxo => { return { txId: utxo.txid, vout: utxo.vout, value: Number(utxo.value) } })

        const feeRate = await getFeeRate()

        const targets = [
            {
                address,
                value
            }
        ]

        const { inputs, outputs, fee } = coinSelect(utxos, targets, feeRate)

        if (!inputs || !outputs) throw new Error(`utxos selections failed because no solution was found for address ${address} with value ${value}`)

        return { inputs, outputs, fee }
    } catch (e) {
        throw e
    }
}

const getTxDetails = async (hashes: string[]): Promise<any[]> => {
    try {
        const results = await Promise.all(hashes.map(hash => callBlockbook({ method: blockbookMethods.tx, data: hash })))

        return results
    } catch (e) {
        throw e
    }
}

// getFeeRate()

// getUtxos('mi7JyT8UAG6Ksd4LJbVuX866ssomxAZAY9').then(console.log).catch(console.error)

selectUtxos('mi7JyT8UAG6Ksd4LJbVuX866ssomxAZAY9', 607400).then(console.log)

// getTxDetails(['1032d69cea56b11777757d0eabc8d8f74ab5207466b1d4a9fb762fce54550a69', '393c5822388f706d3e97f9c0289651aac242eaa7122ab30b09e6df1190b7ae4a']).then(console.log)
