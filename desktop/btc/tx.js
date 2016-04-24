var axios = require('axios')
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

// axios.defaults.headers.post['Content-Type'] = 'application/json'

module.exports = {
  dispatch: dispatch,
  getUnsignedTransactions: getUnsignedTransactions,
  build: build
}

function build (pubkeyStr, toAddress, satoshis) {
  var pubkey = new bitcore.PublicKey(pubkeyStr, {network: Networks.testnet})
  var address = pubkey.toAddress()

  return axios.get('http://tbtc.blockr.io/api/v1/address/unspent/' + address)
  .then(function (res) {
    var _utxo = res.data.data.unspent[0]
    var utxo = {
      txId: _utxo.tx,
      outputIndex: _utxo.n,
      address: res.data.data.address,
      script: _utxo.script,
      satoshis: Math.round(_utxo.amount * 1e8)
    }

    var transaction = new bitcore.Transaction()
      .from(utxo)
      .to(toAddress, satoshis)
      .change(address)

    var unsignedTxs = getUnsignedTransactions(transaction, pubkey)

    return {
      transaction: transaction,
      unsignedTransactions: unsignedTxs
    }
  })
}

function dispatch (transaction, sigStuff, sigStr) {
  applySignature(transaction, sigStuff, sigStr)
  return axios.post('http://tbtc.blockr.io/api/v1/tx/push', {hex: transaction.serialize()})
}

function applySignature (transaction, sigStuff, sigStr) {
  var sig = Signature.fromString(sigStr)
  sig.s = ECDSA.toLowS(sig.s)
  sigStuff.signature = sig
  var txSig = new TransactionSignature(sigStuff)
  transaction.applySignature(txSig)
}

function getUnsignedTransactions (tx, publicKey, sigtype) {
  $.checkState(tx.hasAllUtxoInfo())
  if (_.isArray(publicKey)) {
    _.each(publicKey, function (publicKey) {
      getUnsignedTransactions(tx, publicKey, sigtype)
    })
    return
  }

  return getTransactionHashes(tx, publicKey, sigtype)
}

function getTransactionHashes (transaction, publicKey, sigtype) {
  sigtype = sigtype || Signature.SIGHASH_ALL
  var results = []
  var hashData = Hash.sha256ripemd160(publicKey.toBuffer())
  _.each(transaction.inputs, function forEachInput (input, index) {
    _.each(getInputHashes(input, transaction, publicKey, index, sigtype, hashData), function (hash) {
      results.push(hash)
    })
  })
  return results
}

function getInputHashes (input, transaction, publicKey, index, sigtype, hashData) {
  $.checkState(input.output instanceof Output)
  hashData = hashData || Hash.sha256ripemd160(publicKey.toBuffer())
  sigtype = sigtype || Signature.SIGHASH_ALL

  if (BufferUtil.equals(hashData, input.output.script.getPublicKeyHash())) {
    var hash = Sighash.sighash(transaction, sigtype, index, input.output.script)
    var sigStuff = {
      publicKey: publicKey,
      prevTxId: input.prevTxId,
      outputIndex: input.outputIndex,
      inputIndex: index,
      hash: BufferUtil.reverse(hash).toString('hex'),
      sigtype: sigtype
    }

    return [sigStuff]
  }
  return []
}
