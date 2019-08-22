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

Ae({
  url: 'https://sdk-testnet.aepps.com',
  internalUrl: 'https://sdk-testnet.aepps.com',
  compilerUrl: 'https://compiler.aepps.com',
  keypair: config.keypair,
  network_id: "ae_uat"
}).then(ae => {

  ae.registerOracle("{'domain': str}", "{'txt': str}", { queryFee: 1, ttl:50 }).catch(async err => await err.verifyTx()).then(oracle => {
    console.log(oracle);
  })
})


app.get("/", function(req, res) {
    res.send("Weallet Oracle Service")
})

app.get("/v1/api/verify/domain/:domain", function(req, res) {
    const options = {
        host: 'dns.google',
        port: 443,
        path: '/resolve?name='+req.params.domain+'&type=TXT',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
    };

    rest.getJSON(options, (statusCode, result) => {
        console.log(`onResult: (${statusCode})\n\n${JSON.stringify(result)}`);
        res.statusCode = statusCode;
        res.send(result);
      })
})
app.listen(3000)

