var bitcore = require('bitcore-lib')
var crypto = bitcore.crypto
var Point = crypto.Point
var ECDSA = crypto.ECDSA
var PublicKey = bitcore.PublicKey
var Signature = crypto.Signature

var x = new Buffer('AE4A2B223D75A9535F42D274990DA6FF8E892D51D17395C5306E3B05EEFE6F11', 'hex')
var y = new Buffer('20D7BB59AF7420882727C55C0DD9F063642755BD9E5C616E3335A05BB5B383AA', 'hex')
var point = new Point(x, y)
var pubkey = PublicKey.fromPoint(point)
var sig = Signature.fromString('304502205B36869A88231A4DAD41890642FA492E506D404AAF3548F92D939CC03951BD63022100BCD10B3025F18537079DA3C79D9B47FD8E287F1C356158818D48A716DEFEBCDA')
sig.s = ECDSA.toLowS(sig.s)
var hashBuf = new Buffer('D37E2B4FAB26640551C69ABC3BDF1C14534B215C7F3E1D44C0B65029C99147AE', 'hex')
var res = ECDSA.verify(hashBuf, sig, pubkey, false)

console.log(res)
