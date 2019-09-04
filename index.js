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

function decodeQuery(data) {
  return Crypto.decodeBase64Check(data.slice(3)).toString();
}

Ae({
  url: 'https://sdk-testnet.aepps.com',
  internalUrl: 'https://sdk-testnet.aepps.com',
  compilerUrl: 'https://compiler.aepps.com',
  keypair: config.keypair,
}).then(ae => {

  // // // Register Waellet Oracle
  // ae
  //   .registerOracle("{'domain': str}", "{'txt': str}", { queryFee: 1, ttl:50 })
  //   .catch(async err => await err.verifyTx())
  //   .then(oracle => {
  //     console.log(oracle);
  //   })

  // Get Oracle Object and answer queries
  ae
    .getOracleObject(oracleId)
    .then(oracleObject => {
      
      oracleObject.queries.forEach(query => {

        let checkDomain = decodeQuery(query.query);
        console.log(checkDomain);
        console.log(query.id);
        oracleObject
          .respondToQuery(query.id, "yes")
          .then(result => console.log(result));
        
        // ae
        // .getQueryObject(oracleId, query.id)
        // .then(queryObject => {
        //   console.log(queryObject);
        //   console.log(queryObject.decode(queryObject.query).toString());

        //   console.log('\n RESPOND');


        //   queryObject.respond("yes").then(result => {
        //     console.log(result);
        //   });
        // })
      });
    })

  // // Extend Oracle
  // ae
  //   .extendOracleTtl(oracleId, { type: 'delta', value: 500 })
  //   .then(result => {
  //     console.log('\n EXTEND');
  //     console.log(result);
  //   })
})

// Ae({
//   url: 'https://sdk-testnet.aepps.com',
//   internalUrl: 'https://sdk-testnet.aepps.com',
//   compilerUrl: 'https://compiler.aepps.com',
//   keypair: config.client,
// }).then(ae => {

//   // Post query to oracle
//   ae
//     .postQueryToOracle(oracleId, "hack.bg")
//     .then(result => {
//       console.log(result);
//     })
// })

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

