// eslint-disable-next-line no-global-assign
require = require("esm")(module/* , options */)

import Ae from '@aeternity/aepp-sdk/es/ae/universal'
import Oracle from '@aeternity/aepp-sdk/es/oracle/'
import Tx from '@aeternity/aepp-sdk/es/tx'
import * as Crypto from '@aeternity/aepp-sdk/es/utils/crypto'

const express = require("express")
const rest = require('./rest')
const app = express()
const config = require('./config/config')

let oracleId = "ok" + config.keypair.publicKey.slice(2);

function decode(data) {
  return Crypto.decodeBase64Check(data.slice(3)).toString();
}

Ae({
  url: 'https://sdk-testnet.aepps.com',
  internalUrl: 'https://sdk-testnet.aepps.com',
  compilerUrl: 'https://compiler.aepps.com',
  keypair: config.client,
}).then(ae => {

  // Post query to oracle
  ae
  .postQueryToOracle(oracleId, 'waellet.com')
  .then(result => {
    console.log(result);
  })
})