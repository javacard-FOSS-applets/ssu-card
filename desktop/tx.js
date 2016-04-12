var bitcoin = require('bitcoinjs-lib')
var tx = new bitcoin.TransactionBuilder()

// TODO: Use bitcore instead -- modify getSignatures part

var network = bitcoin.networks.testnet
// var keyPair = bitcoin.ECPair.makeRandom({network: network})
var keyPair = bitcoin.ECPair.fromWIF('cTUDt8nosJH1fHTryCLhYeQ915KFRZuBwWxN5NgQhh9T12LAiJC4', network)
var address = keyPair.getAddress()
console.log(address)

var txb = new bitcoin.TransactionBuilder(network)
txb.addInput('855d28b62c59e126229932b3ffc85157ffa49ab9a42ba6868695c79fab495bbd', 0)
txb.addOutput('mh3oC4JjgEzhFWZrKadFrYWw54JGQr9rpz', 0.002 * 1e8)
txb.addOutput('mg2gGCSYXPDnG5q1W25tWdy2iScTLuubDE', 0.002 * 1e8)

var txRaw = txb.buildIncomplete()

console.log(JSON.stringify(txb, null, 2))
var hashType = bitcoin.Transaction.SIGHASH_ALL
var redeemScript = new Buffer('76a914059f18946acc41a1cbe22c8fe434827053f5daf588ac', 'hex')
var signatureHash = txRaw.hashForSignature(0, redeemScript, hashType)
console.log(signatureHash.toString('hex'))


// TODO: save priv/pub keys, do end-to-end with signing
