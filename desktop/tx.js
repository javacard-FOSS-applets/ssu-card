var bitcoin = require('bitcoinjs-lib')
var tx = new bitcoin.TransactionBuilder()

var network = bitcoin.networks.testnet
// var keyPair = bitcoin.ECPair.makeRandom({network: network})
// var address = keyPair.getAddress()

var txb = new bitcoin.TransactionBuilder(network)
txb.addInput('80699c716c675f790478f1aa0652fea4b9746390244124f35591f9ad8f091d36', 0)
txb.addOutput('mh3oC4JjgEzhFWZrKadFrYWw54JGQr9rpz', 0.005 * 1e8)
txb.addOutput('mkYguUPTxbjSdL1UEkLecVV9ubAa8fRTbV', 0.005 * 1e8)

var txRaw = txb.buildIncomplete()

var hashType = bitcoin.Transaction.SIGHASH_ALL
var redeemScript = new Buffer('76a914372c9d4e78473f6e36feebf031099fad5f68228b88ac', 'hex')
var signatureHash = txRaw.hashForSignature(0, redeemScript, hashType)
console.log(signatureHash.toString('hex'))
