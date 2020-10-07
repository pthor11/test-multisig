import { ECPair, payments, networks } from "bitcoinjs-lib"

const network = networks.testnet

const generateKeyPair = () => {
    const keyPair = ECPair.makeRandom({ network })
    const { address } = payments.p2pkh({
        pubkey: keyPair.publicKey,
        network
    })

    const publicKey = keyPair.publicKey.toString('hex')

    const privateKey = keyPair.toWIF()

    return { address, privateKey, publicKey }
}

const generateMultisig = (numberAccounts: number = 3, minimumSignatures: number = 2) => {
    const accounts: any[] = []

    for (let i = 0; i < numberAccounts; i++) {
        const account = generateKeyPair()
        accounts.push(account)
    }

    const publicKeys = accounts.map(account => account.publicKey)

    const { address } = payments.p2sh({
        redeem: payments.p2ms({
            m: minimumSignatures,
            pubkeys: publicKeys.map(pubkey => Buffer.from(pubkey, 'hex')),
            network
        }),
        network
    })

    return { accounts, multisig: address, publicKeys }
}

console.log(generateMultisig())