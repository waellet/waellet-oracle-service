import Ae from '@aeternity/aepp-sdk/es/ae/universal'
import Node from '@aeternity/aepp-sdk/es/node'
import * as Crypto from '@aeternity/aepp-sdk/es/utils/crypto'

const express = require("express")
const rest = require('./rest')
const app = express()
const util = require('util');
const dns = require('dns');
const setTimeoutPromise = util.promisify(setTimeout);

let oracle_keypair = {
  publicKey: process.env.PUBLIC_KEY,
  secretKey: process.env.SECRET_KEY
}

let oracleId = "ok" + oracle_keypair.publicKey.slice(2);

function decode(data) {
    return Crypto.decodeBase64Check(data.slice(3)).toString();
}

const getOrRegisterOracle = (ins) => async (oracleId) => {
  return ins
    .getOracleObject(oracleId)
    .catch(err => ins.registerOracle("{'domain': str}", "{'txt': str}", {verify: true, queryFee: 1, ttl: 500}))
}

Node.debugSwagger(false)({
  url: 'https://sdk-testnet.aepps.com',
  internalUrl: 'https://sdk-testnet.aepps.com',
}).then(node => {

  Ae({
    compilerUrl: 'https://compiler.aepps.com',
    nodes: [{name: 'testnet', instance: node}],
    keypair: oracle_keypair,
  }).then(async ae => {
    // Get Oracle Object
    setInterval(() => {

      // This is executed after about 20000 milliseconds.
      getOrRegisterOracle(ae)(oracleId)
      // Populate queries
      // .then(async oracle => {
      //     await oracle.postQuery("hack.bg")
      //     await oracle.postQuery("mradkov.com")
      //     return ae.getOracleObject(oracleId)
      // })
      .then(async oracle => {
          // Answer queries
          console.log(`\nPending queries: 0`)
          if (oracle.queries.length) {
            let pendingQueries = oracle.queries.filter((i,n) => {
              return n.response ==='or_Xfbg4g==';
            }).length;
            console.log(`\nPending queries: ${pendingQueries}`)
            for (let query of oracle.queries) {
              if (query.response === 'or_Xfbg4g==') {
                let requestedDomain = decode(query.query)
                console.log(`Requested Domain: ${requestedDomain}`)
                dns.resolveTxt(requestedDomain, async function(err, records) {
                    let response = 'error';
                    if (!err && Array.isArray(records)) {
                      records.forEach(function(value, index) {
                        if (value[0].indexOf('waellet-tip-verification') > -1) {
                          response = value[0].split('=')[1];
                        }
                      })
                    }
                    const respondResult = await oracle.respondToQuery(query.id, response)
                    console.log(respondResult)
                    pendingQueries--
                })
              }
            }
        }
      }).catch(err => console.log(err))
    }, 20000)
}).catch(err => console.log(err))
})

app.get("/", function (req, res) {
    res.send("Weallet Oracle Service")
})

app.listen(3000)