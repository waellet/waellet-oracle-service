import Ae from '@aeternity/aepp-sdk/es/ae/universal'
import Node from '@aeternity/aepp-sdk/es/node'
import * as Crypto from '@aeternity/aepp-sdk/es/utils/crypto'

const express = require("express")
const rest = require('./rest')
const app = express()
const config = require('./config/config')
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

let oracleId = "ok" + config.keypair.publicKey.slice(2);

function decode(data) {
    return Crypto.decodeBase64Check(data.slice(3)).toString();
}

const getOrRegisterOracle = (ins) => async (oracleId) => {
    return ins
        .getOracleObject(oracleId)
        .catch(err => ins.registerOracle("{'domain': str}", "{'txt': str}", {verify: true, queryFee: 1, ttl: 50}))
}

Node.debugSwagger(false)({
    url: 'https://sdk-testnet.aepps.com',
    internalUrl: 'https://sdk-testnet.aepps.com',
}).then(node => {

    Ae({
        compilerUrl: 'https://compiler.aepps.com',
        nodes: [{name: 'testnet', instance: node}],
        keypair: config.keypair,
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
                  if (oracle.queries.length) {
                      let pendingQueries = oracle.queries.filter((i,n) => {
                        return n.response ==='or_Xfbg4g==';
                      }).length;
                      console.log(`\nPending queries: ${pendingQueries}`)
                      for (let query of oracle.queries) {
                          if (query.response === 'or_Xfbg4g==') {
                              let requestedDomain = decode(query.query)
                              console.log(`Requested Domain: ${requestedDomain}`)
                              const response = "yes";
                              const respondResult = await oracle.respondToQuery(query.id, response)
                              console.log(respondResult)
                              pendingQueries--
                          }
                      }
                  }
              }).catch(err => console.log(err))
          }, 20000)
      }
    ).catch(err => console.log(err))
})

app.get("/", function (req, res) {
    res.send("Weallet Oracle Service")
})

app.get("/v1/api/verify/domain/:domain", function (req, res) {
    const options = {
        host: 'dns.google',
        port: 443,
        path: '/resolve?name=' + req.params.domain + '&type=TXT',
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