import { ECPair, networks, payments } from "bitcoinjs-lib";

const network = networks.testnet

const generateAddressP2PKH = () => {
    const keyPair = ECPair.makeRandom({ network })
    const { address } = payments.p2pkh({
        pubkey: keyPair.publicKey,
        network
    })
    const publicKey = keyPair.publicKey.toString('hex')
    const privateKey = keyPair.toWIF()

    return { address, privateKey, publicKey }
}

const generateAddressP2SH = (m: number, pubkeys: string[]) => {
    const { address } = payments.p2sh({
        redeem: payments.p2ms({
            m,
            pubkeys: pubkeys.map(pubkey => Buffer.from(pubkey, 'hex')),
            network
        }),
        network
    })

    console.log({ address })

    return address
}

const key1 = generateAddressP2PKH()
const key2 = generateAddressP2PKH()
const key3 = generateAddressP2PKH()

const keys = [key1, key2, key3]

const multisigAddress = generateAddressP2SH(2, keys.map(key => key.publicKey))

console.log({ keys, multisigAddress })

