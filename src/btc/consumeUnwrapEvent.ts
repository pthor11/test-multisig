import { client, collectionNames, db } from "./mongo"
import * as coinSelect from "coinselect";
import { payments, Psbt, address, ECPair } from "bitcoinjs-lib";
import { blockbookMethods, btcAddress, btcPrivateKey, KafkaConfig, multisigAddress, network, publickeys, signatureMinimum } from "./config";
import { callBlockbook } from "./blockbook";
import { producer } from "./kafka";
import { psbts } from "./psbts";

const updateUnwrapEvent = async (transaction: string) => {
    const session = client.startSession()
    session.startTransaction()
    try {
        const { value } = await db.collection(collectionNames.unwraps).findOneAndUpdate({ "result.transaction": transaction }, {
            $addToSet: { "consumer.signs": btcAddress },
            $set: { updateAt: new Date() }
        }, {
            returnOriginal: true,
            session
        })

        if (!value) throw new Error(`transaction ${transaction} not found to unwrap`)

        if (value.consumer?.signs?.includes(btcAddress)) {
            await session.abortTransaction()
        } else {
            await session.commitTransaction()
        }

        session.endSession()
    } catch (e) {
        await session.abortTransaction()
        session.endSession()
        if (e.code === 112) return updateUnwrapEvent(transaction)
        throw e
    }
}

export const consumeUnwrapEvent = async (data: any) => {
    try {
        console.log({ data })

        const transaction = data.result?.transaction
        const toAddress = data.result?.result?.toAddress
        const amount = Number(data.result?.result?.amount)

        if (!transaction) throw new Error(`consumer received unwrap message with no transaction`)

        if (!Number.isInteger(amount)) throw new Error(`consumer received unwrap message with invalid amount ${amount}`)

        if (!address.toOutputScript(toAddress, network)) throw new Error(`consumer received unwrap message with invalid address ${amount} for network ${network}`)

        const { inputs, outputs, fee } = await selectUtxos(multisigAddress, toAddress, amount)

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

        await updateUnwrapEvent(transaction)

        const record = await producer.send({
            topic: KafkaConfig.topicPrefix ? KafkaConfig.topicPrefix + '.' + KafkaConfig.topics.sign : KafkaConfig.topics.sign,
            messages: [{
                value: JSON.stringify({
                    transaction,
                    basePsbtHex,
                    signedPsbtHex
                })
            }]
        })

        console.log({ record })

        psbts[transaction] = {
            baseHex: basePsbtHex,
            signedHexs: [signedPsbtHex]
        }

        console.log({ psbts: JSON.stringify(psbts) })
    } catch (e) {
        console.error(e)
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

const selectUtxos = async (fromAddress: string, toAddress: string, value: number) => {
    try {
        let utxos: any[] = await getUtxos(fromAddress)

        utxos = utxos.map(utxo => { return { txId: utxo.txid, vout: utxo.vout, value: Number(utxo.value) } })

        const feeRate = await getFeeRate()

        const targets = [
            {
                address: toAddress,
                value
            }
        ]

        let { inputs, outputs, fee } = coinSelect(utxos, targets, feeRate)

        if (!inputs || !outputs) throw new Error(`utxos selections failed because no solution was found for address ${address} with value ${value}`)

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
