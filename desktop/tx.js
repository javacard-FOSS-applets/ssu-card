var bitcore = require('bitcore-lib')
var $ = bitcore.util.preconditions
var BufferUtil = bitcore.util.buffer
var ECDSA = bitcore.crypto.ECDSA
var Signature = bitcore.crypto.Signature
var Hash = bitcore.crypto.Hash
var Networks = bitcore.Networks
var Transaction = bitcore.Transaction
var TransactionSignature = Transaction.Signature
var Output = Transaction.Output
var Sighash = Transaction.Sighash

var _ = require('lodash')

// var wif = 'cTUDt8nosJH1fHTryCLhYeQ915KFRZuBwWxN5NgQhh9T12LAiJC4'
// var privkey = new bitcore.PrivateKey(wif)
var pubkeyStr = '04ae4a2b223d75a9535f42d274990da6ff8e892d51d17395c5306e3b05eefe6f1120d7bb59af7420882727c55c0dd9f063642755bd9e5c616e3335a05bb5b383aa'
var pubkey = new bitcore.PublicKey(pubkeyStr, {network: Networks.testnet})
console.log(pubkey.toAddress())
// var address = privkey.toAddress()

var utxo = {
  txId: 'b5a2d5e33ddc2f57cacc4d702e2cc8bfde3479660617f7a9a23ecf3daa7a61ff',
  outputIndex: 1,
  address: 'mxVvKCZZjz6FKynELAkZ2EmDPfp3FEgWj5',
  script: '76a914ba4811c066b4800ae30be9a29fca0ade4a61b7fc88ac',
  satoshis: Math.floor(0.01 * 1e8)
}

var transaction = new bitcore.Transaction()
  .from(utxo)
  .to('mh3oC4JjgEzhFWZrKadFrYWw54JGQr9rpz', 0.002 * 1e8)
  .change('mg2gGCSYXPDnG5q1W25tWdy2iScTLuubDE')

sign(transaction, pubkey)

console.log(transaction.serialize())

function sign (tx, publicKey, sigtype) {
  $.checkState(tx.hasAllUtxoInfo())
  if (_.isArray(publicKey)) {
    _.each(publicKey, function (publicKey) {
      sign(tx, publicKey, sigtype)
    })
    return
  }
  _.each(getSignatures(tx, publicKey, sigtype), function (signature) {
    tx.applySignature(signature)
  })
  return this
}

function getSignatures (transaction, publicKey, sigtype) {
  sigtype = sigtype || Signature.SIGHASH_ALL
  var results = []
  var hashData = Hash.sha256ripemd160(publicKey.toBuffer())
  _.each(transaction.inputs, function forEachInput (input, index) {
    _.each(getInputSignatures(input, transaction, publicKey, index, sigtype, hashData), function (signature) {
      results.push(signature)
    })
  })
  return results
}

function getInputSignatures (input, transaction, publicKey, index, sigtype, hashData) {
  $.checkState(input.output instanceof Output)
  hashData = hashData || Hash.sha256ripemd160(publicKey.toBuffer())
  sigtype = sigtype || Signature.SIGHASH_ALL

  if (BufferUtil.equals(hashData, input.output.script.getPublicKeyHash())) {
    return [new TransactionSignature({
      publicKey: publicKey,
      prevTxId: input.prevTxId,
      outputIndex: input.outputIndex,
      inputIndex: index,
      signature: sighashSign(transaction, sigtype, index, input.output.script),
      sigtype: sigtype
    })]
  }
  return []
}

function sighashSign (transaction, sighashType, inputIndex, subscript, signer) {
  var hashbuf = Sighash.sighash(transaction, sighashType, inputIndex, subscript)
  console.log('hash to sign:')
  console.log(BufferUtil.reverse(hashbuf).toString('hex'))
  var sigStr = '3045022100DF881442164DE9C5DAD827534F01D3CC63A28F9AAC847CDE842D879FF7A3688E022014EE1B23C0C1C362B011E1A059A235CB63A5127B54C1E4E12D52CF9740C3A445'
  var sig = Signature.fromString(sigStr)
  sig.s = ECDSA.toLowS(sig.s)
  return sig
}
