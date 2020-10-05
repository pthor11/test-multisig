import { Psbt, payments, ECPair } from "bitcoinjs-lib"
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
        const result = await callBlockbook({
            method: blockbookMethods.estimatefee,
            data: 6
        })

        const feeRateKilobytePerSatoshi = Number(result?.result)

        if (!feeRateKilobytePerSatoshi) throw new Error(`estimate feerate from blockbook is invalid ${result?.result}`)

        return feeRateKilobytePerSatoshi * (10 ** 5)
    } catch (e) {
        throw e
    }
}

const calculateTotalVin = (inputs: any[]) => inputs.reduce((total, input) => total + input.value, 0)
const calculateTotalVout = (outputs: any[]) => outputs.reduce((total, output) => total + output.value, 0)
const calculateByteSize = (inputs: any[], outputs: any[]) => 10 + inputs.length * 298 + outputs.length * 32
const calculateFee = (inputs: any, outputs: any[], feeRate: number) => calculateByteSize(inputs, outputs) * feeRate

const selectUtxos = async (fromAddress: string, toAddress: string, value: number) => {
    try {
        const utxos: any[] = await getUtxos(fromAddress)

        utxos.sort((utxo1, utxo2) => utxo1.value - utxo2.value).forEach(utxo => utxo.value = Number(utxo.value))

        console.log({ utxos: utxos.length })

        const feeRate = await getFeeRate()

        console.log({ feeRate })


        const inputs: any[] = []
        const outputs: any[] = [{ address: toAddress, value }]

        for (const utxo of utxos) {
            console.log({ utxo })

            inputs.push(utxo)

            const totalVin = calculateTotalVin(inputs)
            const totalVout = calculateTotalVout(outputs)
            const fee = calculateFee(inputs, outputs, feeRate)
            const change = totalVin - totalVout - fee

            console.log({ totalVin, totalVout, fee, change })

            if (change >= 0) {
                const subChange = change - 32 * feeRate
                console.log({ subChange })
                if (subChange > 0) outputs.push({
                    address: multisigAddress,
                    value: subChange
                })
                break
            }

        }

        return { inputs, outputs }
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

const createPsbtRawHex = async (params: { userBtcAddress: string, userAmount: number }): Promise<{ base: string, signed: string }> => {
    try {
        const { inputs, outputs } = await selectUtxos(multisigAddress, params.userBtcAddress, params.userAmount)

        console.log({ inputs, outputs })

        const transactions: any[] = await getTxDetails(inputs.map(input => input.txid))

        const psbt = new Psbt({ network })

        for (let i = 0; i < inputs.length; i++) {
            psbt.addInput({
                hash: inputs[i].txid,
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
                address: outputs[i].address,
                value: outputs[i].value
            })
        }

        const base = psbt.toBase64()

        console.log({ base })

        await psbt.signAllInputsAsync(ECPair.fromWIF(btcPrivateKey, network))

        const signed = psbt.toBase64()

        console.log({ signed })

        return { base, signed }

    } catch (e) {
        throw e
    }
}

export { createPsbtRawHex }