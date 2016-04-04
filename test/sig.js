var bitcore = require('bitcore-lib')
var crypto = bitcore.crypto
var Point = crypto.Point
var ECDSA = crypto.ECDSA
var PublicKey = bitcore.PublicKey
var Signature = crypto.Signature

var x = new Buffer('B3F9ED551F3BBCE671DE36FACF3136701700B5118A296FC2DD569886CCEC462A', 'hex')
var y = new Buffer('C253246BC7DB3077DE527C1DD812C2D621487CF9626C5031002310858577E8A6', 'hex')
var point = new Point(x, y)
var pubkey = PublicKey.fromPoint(point)
var sig = Signature.fromString('304402202579AA1C9D9D76AAA2D7F775B6F2379EE12F78AF1D42DCFD388D81C3C2FCDA7B02200E17FCA93FEAD600CE0D83E115601E415719E749BE75A76065978E8A6B2E23BD')
sig.s = ECDSA.toLowS(sig.s)
var hashBuf = new Buffer('D37E2B4FAB26640551C69ABC3BDF1C14534B215C7F3E1D44C0B65029C99147FC', 'hex')
var res = ECDSA.verify(hashBuf, sig, pubkey, false)

console.log(res)
