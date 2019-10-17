
const express = require('express')
const app = express()

app.get("/", function (req, res) {
  res.send("Weallet Oracle Service")
})

app.listen(process.env.PORT || 3000)

