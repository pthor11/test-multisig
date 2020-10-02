import { Psbt, payments, ECPair } from "bitcoinjs-lib"
import * as coinSelect from "coinselect";
import { network, multisigAddress, signatureMinimum, publickeys, btcPrivateKey, blockbookMethods } from "../config"
import { callBlockbook } from "./blockbook"

const getUtxos = async (address: string): Promise<any[]> => {
    try {
        const utxos = await callBlockbook({
            method: blockbookMethods.utxo,
            data: address
        })

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

const selectUtxos = async (fromAddress: string, toAddress: string, value: number) => {
    try {
        let utxos: any[] = await getUtxos(fromAddress)

        utxos = utxos.map(utxo => { return { txId: utxo.txid, vout: utxo.vout, value: Number(utxo.value) } })

        // console.log({ utxos })

        const feeRate = await getFeeRate()

        // console.log({ feeRate })

        const targets = [
            {
                address: toAddress,
                value
            }
        ]

        // console.log({ targets })

        let { inputs, outputs, fee } = coinSelect(utxos, targets, feeRate)

        // console.log({ inputs, outputs, fee })


        if (!inputs || !outputs) throw new Error(`utxos selections failed because no solution was found for address ${fromAddress} with value ${value}`)

        const p2shFee = 10 + inputs.length * 298 + outputs.length * 32

        outputs.forEach(output => output.value = output.address ? output.value : output.value + fee - p2shFee)

        fee = p2shFee

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

const createPsbtRawHex = async (params: { userBtcAddress: string, userAmount: number }): Promise<{ basePsbtHex: string, signedPsbtHex: string }> => {
    try {
        const { inputs, outputs, fee } = await selectUtxos(multisigAddress, params.userBtcAddress, params.userAmount)

        console.log({ inputs, outputs, fee })

        const transactions: any[] = await getTxDetails(inputs.map(input => input.txId))

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

        const basePsbtHex = psbt.toBase64()

        console.log({ basePsbtHex })

        await psbt.signAllInputsAsync(ECPair.fromWIF(btcPrivateKey, network))

        const signedPsbtHex = psbt.toBase64()

        console.log({ signedPsbtHex })

        return { basePsbtHex, signedPsbtHex }

    } catch (e) {
        throw e
    }
}

export { createPsbtRawHex }