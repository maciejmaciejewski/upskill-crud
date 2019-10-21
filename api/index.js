const express = require('express')
const bodyParser = require('body-parser')
const uuid = require('uuid/v4')
const app = express()
const { MongoClient } = require('mongodb')
const url = 'mongodb://admin:test@db:27017/admin'
let database

app.use(bodyParser.json())
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Cache-Control')

  return next()
})

MongoClient.connect(url, (err, client) => {
  if (err) { console.log(err) }
  database = client.db('database')

  const port = 3000
  app.listen(port, () => {
    console.log(`Starting application on port ${port}`)
  })
})

app.get('/cats', async function (req, res) {
  const result = await database.collection('cats').find().toArray()
  return res.status(200).send(result)
})

app.post('/cats', async function (req, res) {
  const requestBody = req.body
  requestBody.id = uuid()
  console.log(requestBody)

  await database.collection('cats').insertOne(requestBody)
  return res.status(201).send(req.body)
})

app.get('/cats/:id', async function (req, res) {
  const result = await database.collection('cats').find({ id: req.params.id }).toArray()
  console.log(result)
  if (result.length !== 0) {
    return res.status(200).send(result[0])
  } else {
    return res.status(404).send({
      message: 'Cat not found in database'
    })
  }
})

app.delete('/cats/:id', async function (req, res) {
  const result = await database.collection('cats').deleteOne({ id: req.params.id })
  if (result.deletedCount !== 0) {
    return res.status(200).send()
  } else {
    return res.status(404).send({
      message: 'Cat not found in database'
    })
  }
})
