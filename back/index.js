const { get } = require('axios')
const express = require('express')
const path = require('path')
const Decimal = require('decimal.js')
const bodyParser = require("body-parser")
const { MongoClient } = require('mongodb')
const app = express()
const uri = ''
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

let cachedDb = null

async function connectToDatabase(uri) {
  if (cachedDb) return cachedDb
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  const db = await client.db('watermoneydb')
  cachedDb = db
  return db
}

app.use('/', express.static(path.join(__dirname, '../dist')))

app.get('/getLastData', async (req, res) => {
  const door = +req.query.door
  const db = await connectToDatabase(uri)
  const collection = await db.collection('wmcollection')
  const data = await collection.find({ door }).toArray()
  res.send(data)
})

app.post('/saveTemp', async (req, res) => {
  const {door, val, ts} = req.body
  const now = new Date(ts * 1000)
  const db = await connectToDatabase(uri)
  const collection = await db.collection('wmcollection')
  const [{ history }] = await collection.find({ door }).toArray()
  const last = history.sort((a, b) => b.ts - a.ts)[0]
  const lastVal = last.val
  const lastTs = new Date(Math.max(last.ts, 1640880000) * 1000)
  const data = await collection.updateOne({ door }, { $set: { temp: {val, ts} }})
  const wprice = new Decimal(val).minus(lastVal).mul(3.1)
  const gprice = ((now.getYear() - lastTs.getYear()) * 12 + now.getMonth() - lastTs.getMonth()) * 8
  get(`http://localhost:8080/dak4o5tFLtqPVwsUGtpXiK/%23${door}/%E5%BA%94%E4%BB%98%E6%AC%BE%C2%A5${wprice.plus(gprice)}%EF%BC%8C%E8%AF%B7%E7%A1%AE%E8%AE%A4%E6%94%B6%E6%AC%BE?url=https://42.gaoryrt.com/water/confirmTemp?door=${door}&icon=https://cdn.jsdelivr.net/gh/gaoryrt/f/202111161522629.png`)
  res.send(data)
})

app.get('/confirmTemp', async (req, res) => {
  const door = +req.query.door
  const db = await connectToDatabase(uri)
  const collection = await db.collection('wmcollection')
  const [{ temp, history }] = await collection.find({ door }).toArray()
  const lastTs = history.sort((a, b) => b.ts - a.ts)[0].ts
  if (!temp) res.send({ error: '?????? temp ??????' })
  else if (lastTs === temp.ts) res.send({ error: 'temp ??????????????????' })
  else {
    const data = await collection.updateOne({ door }, { $set: { temp: null, history: [...history, temp] }})
    if (data.modifiedCount === 1) res.send('?????????')
    else res.send(data)
  }
})

app.get('/whatsup', async(req, res) => {
  const db = await connectToDatabase(uri)
  const collection = await db.collection('wmcollection')
  res.send(await collection.find({}).toArray())
})

app.listen(4040, () => {
  console.log('started')
})
