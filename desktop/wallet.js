var cardreader = require('card-reader')
var bitcore = require('bitcore-lib')
var Networks = bitcore.Networks

cardreader.on('device-activated', function (reader) {
  console.log(`Device '${reader.reader.name}' activated`)
})

cardreader.on('device-deactivated', function (reader) {
  console.log(`Device '${reader}' deactivated`)
})

cardreader.on('card-removed', function (reader) {
  console.log(`Card removed from '${reader.reader.name}' `)
})

cardreader.on('command-issued', function (res, command) {
  // console.log(`Command '${res.command.toString('hex')}' issued to '${res.reader.name}' `)
})

cardreader.on('response-received', function (res) {
  // console.log(`Response '${res.response.toString('hex')}' received from '${res.reader.name}' in response to '${res.command.toString('hex')}'`)
})

cardreader.on('error', function (message) {
  console.log(`Error '${message}' received`)
})

cardreader.on('card-inserted', function (reader, status) {
  console.log(`Card inserted into '${reader.reader.name}' `)

  cardreader
  .issueCommand(reader.reader, '00A4040006A00000000107')
  .then(function (res) {
    return cardreader.issueCommand(reader.reader, 'b0010000')
  })
  .then(function (res) {
    var pubkeyStr = res.slice(0, -2).toString('hex')
    var publicKey = new bitcore.PublicKey(pubkeyStr, {network: Networks.testnet})
    var address = publicKey.toAddress()
    console.log('Your bitcoin address: ' + address)
    console.log('Your pubkey: ' + publicKey.toString())
  })
  .catch(function (error) {
    console.log('DEBUG1')
    console.error(error)
  })
})
