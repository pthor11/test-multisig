import { payments, ECPair } from "bitcoinjs-lib"
import { network, signatureMinimum, wifs } from "./config"

let multisigAddress: string | undefined

const { address } = payments.p2sh({
    redeem: payments.p2ms({
        m: signatureMinimum,
        pubkeys: wifs.map(wif => ECPair.fromWIF(wif, network).publicKey),
        network
    }),
    network
})

multisigAddress = address

console.log({ multisigAddress });

export { multisigAddress }