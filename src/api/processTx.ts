import { ClientSession } from "mongodb"
import { multisigAddress } from "./config"
import { ActionType } from "./models/Action"
import { TxProcessStatus } from "./models/Tx"
import { client, collectionNames, db } from "./mongo"
import { tronweb } from "./tronweb"

const processWrapTx = async (raw: any, session: ClientSession) => {
    try {
        const ouput = raw.vout.find(output => output.isAddress && output.addresses.find(address => address === multisigAddress))
        const opreturnOutput = raw.vout.find(output => !output.isAddress && output.addresses.find(address => address.includes('OP_RETURN')))

        const subHex = opreturnOutput ? opreturnOutput.hex.substr(4) : ''

        const trxAddress = Buffer.from(subHex, 'hex').toString()

        const value = parseInt(ouput.value)

        if (!tronweb.isAddress(trxAddress)) {
            await db.collection(collectionNames.txs).updateOne({
                "raw.txid": raw.txid
            }, {
                $set: {
                    processed: true,
                    status: TxProcessStatus.invalidTrxAddress,
                    updatedAt: new Date()
                }
            }, { session })

        } else {
            await Promise.all([
                db.collection(collectionNames.txs).updateOne({
                    "raw.txid": raw.txid
                }, {
                    $set: {
                        processed: true,
                        status: TxProcessStatus.valid,
                        updatedAt: new Date()
                    }
                }, { session }),
                db.collection(collectionNames.actions).updateOne({
                    btcHash: raw.txid
                }, {
                    btcTime: new Date(raw.blockTime * 1000),
                    trxAddress,
                    value,
                    updatedAt: new Date()
                }, {
                    upsert: true,
                    session
                })
            ])
        }

        await session.commitTransaction()

        session.endSession()
    } catch (e) {
        
        throw e
    }
}

const processUnWrapTx = async (raw: any, session: ClientSession) => {
    // try {
    //     await db.collection(collectionNames.btcTxs).updateOne({ "raw.txid": raw.txid }, {
    //         $set: {
    //             processed: true,
    //             status: 'UnWrap pending ....',
    //             updatedAt: new Date()
    //         }
    //     })
    // } catch (e) {
    //     throw e
    // }
}

const processTx = async () => {
    const session = client.startSession()
    session.startTransaction()

    try {
        const unprocessedTx = await db.collection(collectionNames.txs).findOne({
            processed: false
        }, {
            sort: { "raw.blockHeight": 1 }
        })

        const raw = unprocessedTx?.raw

        if (!raw) return setTimeout(processTx, 1000)

        const type = raw.vin.find(input => input.isAddress && input.addresses.includes(multisigAddress)) ? ActionType.unwrap : ActionType.wrap

        switch (type) {
            case ActionType.wrap:
                await processWrapTx(raw, session)
                break;
            case ActionType.unwrap:
                await processUnWrapTx(raw, session)
                break;
            default:
                break;
        }

        setTimeout(processTx, 100)
    } catch (e) {
        await session.abortTransaction()
        session.endSession()

        setTimeout(processTx, 1000)
        throw e
    }
}

export { processTx }