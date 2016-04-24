var Tx = require('ethereumjs-tx')
var Web3 = require('web3')
var BigNumber = require('bignumber.js')

var web3 = new Web3()

function createTransaction () {
  var rawTx = {
    nonce: '0x00',
    gasPrice: '0x4e3b29200',
    gasLimit: '0x5208',
    to: '0x1Fa31d8C93261924AcaCebd3343390c765ab2332',
    value: '0x11c37937e08000'
  }

  return new Tx(rawTx)
}

function getHash (tx) {
  var msgHash = tx.hash(false)
  return msgHash
}

function convertSignature (sig, v) {
  return {
    r: sig.r,
    s: sig.s,
    v: v + 27
  }
}

function sendTx (tx) {
  var serializedTx = tx.serialize()
  console.log(serializedTx.toString('hex'))
  // var txHash = web3.eth.sendRawTransaction(serializedTx)
  // console.log(txHash)
}

function applySignature (tx, rawSig) {
  var sig = Signature.fromString(rawSig)
  sig.s = ECDSA.toLowS(sig.s)

  for (var i = 0; i <= 3; i++) {
    var _sig = convertSignature(sig, i)
    Object.assign(tx, _sig)
    var res = tx.verifySignature()
    if (res && tx._senderPubKey.equals(pubkeyBuf)) return true
  }

  throw new Error('Invalid signature')
}

var tx = createTransaction()

var bitcore = require('bitcore-lib')
var crypto = bitcore.crypto
var Signature = crypto.Signature
var ECDSA = crypto.ECDSA

// a = w.fromPublicKey(pkb.slice(1))
// a.getChecksumAddressString()
// 0x53f8f5b5e3753dAf1e0B4E5c467ae8F431031B94

// /*
var hash = getHash(tx)
console.log(hash.toString('hex'))
// */

var pubkey = '04AE4A2B223D75A9535F42D274990DA6FF8E892D51D17395C5306E3B05EEFE6F1120D7BB59AF7420882727C55C0DD9F063642755BD9E5C616E3335A05BB5B383AA'
var pubkeyBuf = new Buffer(pubkey, 'hex').slice(1)
// var rawSig = '304402204BFE46A91514D3B760CBA2FEB68C2D900FB5EEE36A14859528E8D2B70D3B880302206B5C5B22F2627AA72253210D3B822E4ED7A90EAF8005EEA5D6ED5EE6C9744DE3'
var rawSig = '3046022100E75A5A59A4821B41CE0B3B813861CDCC19F11F4F8BF4013F748DD4EDEBCCADE20221008BA7668236717EF5F43297FB74A32735F840AD53C93D49790F200DA7998225CF'
applySignature(tx, rawSig)
sendTx(tx)
