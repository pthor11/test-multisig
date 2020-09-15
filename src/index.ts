import { ECPair, networks, payments, Psbt } from "bitcoinjs-lib";
import { accounts } from "./accounts";

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

const multisigAddress = generateAddressP2SH(2, Object.keys(accounts).map(person => accounts[person].publicKey))

console.log({ multisigAddress })

const sendP2khTransactionByPsbt = async (value: number, fee: number, address: string) => {
    const psbt = new Psbt({ network })

    psbt.addInput({
        hash: '18f9ac90c7a474b0d78315677065e6254b9916883e8af6dfd8d8943fa144e880',
        index: 0,
        nonWitnessUtxo: Buffer.from('02000000000101bb7f169155840482bfe9bc82026882dce8816fc73c8b4150c1e3190745a2878b0100000017160014aa3253ad8df3b9b6eab0923a16e3faddc03f1115feffffff02a0860100000000001976a9141c6fa80d00075917ec0cef054f29fc57fffd668e88acc5f81c000000000017a9145bf4501d292ebfdbf9d566541b74372bad8c4f3a8702473044022020972647c8e0c65574bb9d0d0b17d9350c14c9038337f17bc6addcf158c0e22402201d5f983e4e607d68a59ade6ff412c5244fea362bb3b6ff6ade9b2ef75b025f5d012103b3defd6da3bfdb59e19375db758e21cd4bdef4bfc532ccaff26c9da581ad34bc09fe1b00', 'hex')
    })

    psbt.addOutput({
        address,
        value
    })

    psbt.addOutput({
        address: accounts.alice.address,
        value: 100000 - value - fee
    })

    psbt.signInput(0, ECPair.fromWIF(accounts.alice.privateKey, network))

    psbt.validateSignaturesOfInput(0)

    psbt.finalizeAllInputs()

    const raw_tx = psbt.extractTransaction().toHex()

    console.log({ raw_tx });

}

// sendP2khTransactionByPsbt(10000, 223, multisigAddress as string)

