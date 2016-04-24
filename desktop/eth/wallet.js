var cardreader = require('card-reader')
var inquirer = require('inquirer')
var tx = require('./tx')

var rec

cardreader.on('error', function (message) {
  console.log(`Error '${message}' received`)
})

cardreader.on('card-inserted', function (reader, status) {
  cardreader
  .issueCommand(reader.reader, '00A4040006A00000000107')
  .then(function (res) {
    var hash = rec.unsignedTransactions[0].hash
    var cmd = 'b002000020' + hash
    return cardreader.issueCommand(reader.reader, cmd)
  })
  .then(function (_res) {
    console.log('Thanks! Funds sent!')
    var transaction = rec.transaction
    var sigStuff = rec.unsignedTransactions[0]
    var res = _res.slice(0, -2).toString('hex')
    return tx.dispatch(transaction, sigStuff, res)
  })
  .then(function () {
    console.log('Transaction published.')
    process.exit(0)
  })
  .catch(function (error) {
    console.log('DEBUG1')
    console.error(error)
    process.exit(1)
  })
})

var pubkey = '04AE4A2B223D75A9535F42D274990DA6FF8E892D51D17395C5306E3B05EEFE6F1120D7BB59AF7420882727C55C0DD9F063642755BD9E5C616E3335A05BB5B383AA'

var questions = [{
  name: 'address',
  message: 'Receiving address:'
}, {
  name: 'amount',
  message: 'Amount in mBTC:'
}]

inquirer.prompt(questions)
.then(function (res) {
  console.log('One moment...')
  return tx.build(pubkey, res.address, Math.floor(res.amount * 1e5))
})
.then(function (res) {
  rec = res
  console.log('You may now tap your card')
})
.catch(function (err) {
  console.log(err.stack)
})
