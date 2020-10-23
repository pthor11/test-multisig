import { payments, ECPair } from "bitcoinjs-lib"
import { network, signatureMinimum, wifs, sigType } from "./config"

let multisigAddress: string | undefined

const pubkeys = wifs.map(wif => ECPair.fromWIF(wif, network).publicKey)

switch (sigType) {
    case 'legacy':
        multisigAddress = payments.p2sh({
            redeem: payments.p2ms({
                m: signatureMinimum,
                pubkeys,
                network
            }),
            network
        }).address
        break;
    case 'segwit':
        multisigAddress = payments.p2wsh({
            redeem: payments.p2ms({
                m: signatureMinimum,
                pubkeys,
                network
            }),
            network
        }).address
        break;
    default:
        throw new Error(`invalid sig type`)
}

console.log({ multisigAddress });

export { multisigAddress }