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
  const db = await connectToDatabase(uri)
  const collection = await db.collection('wmcollection')
  const [{ history }] = await collection.find({ door }).toArray()
  const lastVal = history.sort((a, b) => b.ts - a.ts)[0].val
  const data = await collection.updateOne({ door }, { $set: { temp: {val, ts} }})
  get(`http://localhost:8080/dak4o5tFLtqPVwsUGtpXiK/%23${door}/%E5%BA%94%E4%BB%98%E6%AC%BE%C2%A5${new Decimal(val).minus(lastVal).mul(3.1)}%EF%BC%8C%E8%AF%B7%E7%A1%AE%E8%AE%A4%E6%94%B6%E6%AC%BE?url=https://42.gaoryrt.com/water/confirmTemp?door=${door}&icon=https://cdn.jsdelivr.net/gh/gaoryrt/f/202111161522629.png`)
  res.send(data)
})

app.get('/confirmTemp', async (req, res) => {
  const door = +req.query.door
  const db = await connectToDatabase(uri)
  const collection = await db.collection('wmcollection')
  const [{ temp, history }] = await collection.find({ door }).toArray()
  const lastTs = history.sort((a, b) => b.ts - a.ts)[0].ts
  if (!temp) res.send({ error: '没有 temp 数据' })
  else if (lastTs === temp.ts) res.send({ error: 'temp 已经保存过了' })
  else {
    const data = await collection.updateOne({ door }, { $set: { temp: null, history: [...history, temp] }})
    res.send(data)
  }
})

app.get('/whatsup', async(req, res) => {
  const db = await connectToDatabase(uri)
  const collection = await db.collection('wmcollection')
  res.send(await collection.find({}).toArray().map(door => ({
    '户号': door.door,
    '历史': door.history.map(sub => ({
      '读数': sub.val,
      '时间': new Date(sub.ts * 1000).toLocaleString('zh-CN')
    }))
  })))
})

app.listen(4040, () => {
  console.log('started')
})
