// const bitcoin = require('bitcoinjs-lib');
// let testnet = bitcoin.networks.testnet;


// let keyPair1 = bitcoin.ECPair.fromWIF('privateKey1', testnet);    
// let keyPair1wpkh = bitcoin.payments.p2wpkh({pubkey: keyPair1.publicKey, network: testnet});    
// let keyPair2 = bitcoin.ECPair.fromWIF('privateKey2', testnet);
// let keyPair2wpkh = bitcoin.payments.p2wpkh({pubkey: keyPair2.publicKey, network: testnet});

// const psbt = new bitcoin.Psbt({ network: testnet }) 
// let inputdata1 = {
//   hash: "hash of the previous transaction" ,
//   index: index,
//   witnessUtxo: {
//     script: Buffer.from('scriptPubKey_hex', 'hex'),
//     value: 98e4 
//   }
// };

// psbt.addInput(inputdata1);    
// let output1 = {address: keyPair2wpkh.address, value: 97e4};    
// psbt.addOutput(output1);    
// psbt.signInput(0, keyPair1);    
// psbt.finalizeAllInputs();    
// const raw = psbt.extractTransaction().toHex();    
// console.log(raw);