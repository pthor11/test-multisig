import { payments, networks } from "bitcoinjs-lib"
import { publickeys } from "./btc/config"

export const accounts = {
    alice: {
        address: 'mi7JyT8UAG6Ksd4LJbVuX866ssomxAZAY9',
        privateKey: 'cVj5T5wAgKUyo367w1ezHxXrBXXnG8BL5eAbVqVceya1ikxjLDNz',
        publicKey: '02c23eb1375eb0bf42377118c32e7a93fb497764f876e85153ca93783e07d13709'
    },
    bob: {
        address: 'mi1nxULcaCfsJJtvKEpvYfoFWcdub3UMZd',
        privateKey: 'cRwsAPrHhntcF8bx8b3zYgES72fDZwWZ7zKjcVc6dG4i1ZmW3UxP',
        publicKey: '02f8d3ea033f206aea7099d562f56a6427d26fe6e05e07c0b2e1a30b89d5c9034a'
    },
    carol: {
        address: 'mnw9hJ38Pq56TEZGKdGQp6wJFBQDtp4LMW',
        privateKey: 'cQhQTcdMctHhjizWphC13gwNfjfcFGqLhhTibuEo4J2QupykUL1c',
        publicKey: '02777447212c74fbace7453377950ea0943508239b98a1463bc462227cbda7fc5d'
    },
    dave: {
        address: 'mxHTHCzyBFK8ZK3BXszJZQCeixtzdumht4',
        privateKey: 'cUi8whzQVGcVEnAs5B8q39NeHr1eHg8ANrGgx5dGxw1THkZ72T8c',

    },
    emily: {
        address: 'mruaBrQQhrsMjMxaTScfotinjMeQwMajmC',
        privateKey: 'cW9Tp1sFim7nTRc3eQjHrnJCG9H6tATVwVxeWi3dGyqjaUspfHLR'
    }
}

export const multisigAddress = ({ m, pubkeys }: { m: number, pubkeys: string[] }) => {
    const { address } = payments.p2sh({
        redeem: payments.p2ms({
            m,
            pubkeys: pubkeys.map(pubkey => Buffer.from(pubkey, 'hex')),
            network: networks.bitcoin
        }),
        network: networks.bitcoin
    })

    return address
}

console.log(multisigAddress({ m: 2, pubkeys: publickeys }))
