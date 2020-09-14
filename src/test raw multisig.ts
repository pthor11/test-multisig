import { ec } from "elliptic";
import { RIPEMD160, SHA256 } from "crypto-js";
import { encode } from "bs58";
import { equal, ok } from "assert";

const EC = new ec('secp256k1')

const keypair1 = EC.genKeyPair()
const pub1 = keypair1.getPublic().encode('hex', true)
const priv1 = keypair1.getPrivate().toString('hex')

console.log({ pub1, priv1 });

const keypair2 = EC.genKeyPair()
const pub2 = keypair2.getPublic().encode('hex', true)
const priv2 = keypair1.getPrivate().toString('hex')

console.log({ pub2, priv2 });

const keypair3 = EC.genKeyPair()
const pub3 = keypair3.getPublic().encode('hex', true)
const priv3 = keypair3.getPrivate().toString('hex')

console.log({ pub3, priv3 });

const redeemScriptJson = {
    m: 2,
    n: 3,
    pubkeys: [pub1, pub2, pub3]
};
const redeemScript = JSON.stringify(redeemScriptJson)

console.log({ redeemScript });

const redeemScriptSha256 = SHA256(redeemScript).toString()

console.log({ redeemScriptSha256 });

const redeemScriptHash = RIPEMD160(redeemScriptSha256).toString();

console.log({ redeemScriptHash });

const doubleSha = SHA256(SHA256("00" + redeemScriptHash).toString()).toString()
console.log({ doubleSha })

const addressChecksum = doubleSha.substr(0, 8)

console.log({ addressChecksum })

const unencodedAddress = "05" + redeemScriptHash + addressChecksum;

console.log({ unencodedAddress })

const multisigAddress = encode(Buffer.from(unencodedAddress, 'hex'))

console.log({ multisigAddress })

const scriptPubkey = redeemScriptHash

console.log({ scriptPubkey })

const transactionHash = "26783332f46db35atak7c3a271495fbddc811dccf409a9a46e2ce20c906285b0"

const sig1 = Buffer.from(keypair1.sign(transactionHash).toDER()).toString('hex')

console.log({ sig1 })

const sig2 = Buffer.from(keypair2.sign(transactionHash).toDER()).toString('hex')

console.log({ sig2 })

const sig3 = Buffer.from(keypair3.sign(transactionHash).toDER()).toString('hex')

console.log({ sig3 })

const scriptSig = {
    sigs: [
        { signature: sig1, publickey: pub1 },
        { signature: sig2, publickey: pub2 },
        { signature: sig3, publickey: pub3 }
    ],
    redeemScript: redeemScript
}

console.log({ scriptSig })

const scriptSigRedeemScriptHash = RIPEMD160(SHA256(scriptSig.redeemScript).toString()).toString()

console.log({ scriptSigRedeemScriptHash })

equal(scriptSigRedeemScriptHash, scriptPubkey)

ok(scriptSig.sigs.length > redeemScriptJson.m)

const sigkey1 = EC.keyFromPublic(scriptSig.sigs[0].publickey, 'hex')
const sigkey2 = EC.keyFromPublic(scriptSig.sigs[1].publickey, 'hex')
const sigkey3 = EC.keyFromPublic(scriptSig.sigs[2].publickey, 'hex')

ok(sigkey1.verify(transactionHash, scriptSig.sigs[0].signature))
ok(sigkey2.verify(transactionHash, scriptSig.sigs[1].signature))
ok(sigkey3.verify(transactionHash, scriptSig.sigs[2].signature))