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
  keypair: config.keypair,
}).then(ae => {

  // Get Oracle Object and answer queries
  ae
    .getOracleObject(oracleId)
    .catch(async err => {
      let error = await err.verifyTx();
      if(error)
      {
        // Register Waellet Oracle
        ae
          .registerOracle("{'domain': str}", "{'txt': str}", { queryFee: 1, ttl:50 })
          .catch(async err => await err.verifyTx())
          .then(oracle => {
            console.log(oracle);
          })
      }
    })
    .then(oracleObject => {
      console.log(oracleObject);
      
      oracleObject.queries.forEach(query => {

        if (query.response == 'or_Xfbg4g==')
        {

          ae
            .getOracleObject(oracleId)
            .catch(async err => await err.verifyTx())
            .then(syncOracleObject => {
              const requestedDomain = decode(query.query);
              console.log(requestedDomain);
              console.log(query.id);
    
              const response = "yes";
    
              syncOracleObject
                .respondToQuery(query.id, response)
                .catch(async err => await err.verifyTx())
                .then(result => {
                  console.log(`\n Oracle Query Response: \n requested_domain: ${requestedDomain} \n query_response: ${response}`);
                  console.log(result);
                })
            })
          }
      });
    })

  // Extend Oracle
  // ae
  //   .extendOracleTtl(oracleId, { type: 'delta', value: 500 })
  //   .catch(async err => await err.verifyTx())
  //   .then(result => {
  //     console.log('\n Extend oracle');
  //     // console.log(result);
  //   })
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
    // console.log(`onResult: (${statusCode})\n\n${JSON.stringify(result)}`);
    res.statusCode = statusCode;
    res.send(result);
  })
})
app.listen(3000)

