const express = require("express")
const rest = require('./rest')
const app = express()

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
