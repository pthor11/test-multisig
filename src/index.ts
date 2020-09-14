import { ECPair, networks, payments, Psbt } from "bitcoinjs-lib";

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

    return address
}

// const key1 = generateAddressP2PKH()
// const key2 = generateAddressP2PKH()
// const key3 = generateAddressP2PKH()

// const keys = [key1, key2, key3]

// const multisigAddress = generateAddressP2SH(2, keys.map(key => key.publicKey))

// console.log({ keys, multisigAddress })


const keys = [
    {
        address: 'mi7JyT8UAG6Ksd4LJbVuX866ssomxAZAY9',
        privateKey: 'cVj5T5wAgKUyo367w1ezHxXrBXXnG8BL5eAbVqVceya1ikxjLDNz',
        publicKey: '02c23eb1375eb0bf42377118c32e7a93fb497764f876e85153ca93783e07d13709'
    },
    {
        address: 'mi1nxULcaCfsJJtvKEpvYfoFWcdub3UMZd',
        privateKey: 'cRwsAPrHhntcF8bx8b3zYgES72fDZwWZ7zKjcVc6dG4i1ZmW3UxP',
        publicKey: '02f8d3ea033f206aea7099d562f56a6427d26fe6e05e07c0b2e1a30b89d5c9034a'
    },
    {
        address: 'mnw9hJ38Pq56TEZGKdGQp6wJFBQDtp4LMW',
        privateKey: 'cQhQTcdMctHhjizWphC13gwNfjfcFGqLhhTibuEo4J2QupykUL1c',
        publicKey: '02777447212c74fbace7453377950ea0943508239b98a1463bc462227cbda7fc5d'
    }
]

const redeemOutput = payments.p2ms({
    m: 2,
    pubkeys: keys.map(key => ECPair.fromWIF(key.privateKey, network).publicKey),
    network
})

console.log({ redeemOutput: redeemOutput.output?.toString('hex') });

const multisigAddress = '2Mwnxqt1ryXZ1iBHE1dgc1TseQE2bR4kWFP'

const psbt = new Psbt({ network })
