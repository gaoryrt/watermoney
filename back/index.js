const { get } = require("axios");
const express = require("express");
const path = require("path");
const Decimal = require("decimal.js");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const app = express();

const uri = "";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let cachedDb = null;

async function wmdb(uri) {
  if (cachedDb) return cachedDb;
  const connection = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = await connection.db("watermoneydb");
  cachedDb = db;
  return db;
}

let cachedCdb = null;
async function cdb(uri) {
  if (cachedCdb) return cachedCdb;
  const connection = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = await connection.db("countdb");
  cachedCdb = db;
  return db;
}

app.get("/hit", async (req, res) => {
  const { key, hit = false } = req.query;
  if (!key) req.send({ count: 0 });
  const db = await cdb(uri);
  const collection = await db.collection("hit");

  const oldVal = await collection
    .find({ key })
    .toArray()
    .then((arr) => arr[0]);
  if (oldVal) {
    if (hit) {
      const newNum = oldVal.val + 1;
      await collection.updateOne({ key }, { $set: { val: newNum } });
      res.send({ count: newNum });
    } else {
      res.send({ count: oldVal.val });
    }
  } else {
    if (hit) {
      await collection.insertOne({ key, val: 1 });
      res.send({ count: 1 });
    } else {
      await collection.insertOne({ key, val: 0 });
      res.send({ count: 0 });
    }
  }
});

app.use("/", express.static(path.join(__dirname, "../dist")));

app.get("/getLastData", async (req, res) => {
  const door = +req.query.door;
  const db = await wmdb(uri);
  const collection = await db.collection("wmcollection");
  const data = await collection.find({ door }).toArray();
  res.send(data);
});

app.post("/saveTemp", async (req, res) => {
  const { door, val, ts } = req.body;
  const now = new Date(1693584000 * 1000);
  const db = await wmdb(uri);
  const collection = await db.collection("wmcollection");
  const [{ history }] = await collection.find({ door }).toArray();
  const last = history.sort((a, b) => b.ts - a.ts)[0];
  const lastVal = last.val;
  const lastTs = new Date(Math.max(last.ts, 1640880000) * 1000);
  const data = await collection.updateOne(
    { door },
    { $set: { temp: { val, ts } } }
  );
  const wprice = new Decimal(val).minus(lastVal).mul(3.1);
  let monthDuration =
    (now.getYear() - lastTs.getYear()) * 12 +
    now.getMonth() -
    lastTs.getMonth();
  monthDuration = monthDuration < 0 ? 0 : monthDuration;
  const gprice = monthDuration * 8;
  get(
    `http://localhost:8080/GgWta7hnXm5VrkVEkcZGRf/%23${door}/%E5%BA%94%E4%BB%98%E6%AC%BE%C2%A5${wprice.plus(
      gprice
    )}%EF%BC%8C%E8%AF%B7%E7%A1%AE%E8%AE%A4%E6%94%B6%E6%AC%BE?url=https://42.gaoryrt.com/water/confirmTemp?door=${door}&icon=https://cdn.jsdelivr.net/gh/gaoryrt/f/202111161522629.png`
  );
  res.send(data);
});

app.get("/confirmTemp", async (req, res) => {
  const door = +req.query.door;
  const db = await wmdb(uri);
  const collection = await db.collection("wmcollection");
  const [{ temp, history }] = await collection.find({ door }).toArray();
  const lastTs = history.sort((a, b) => b.ts - a.ts)[0].ts;
  if (!temp) res.send({ error: "没有 temp 数据" });
  else if (lastTs === temp.ts) res.send({ error: "temp 已经保存过了" });
  else {
    const data = await collection.updateOne(
      { door },
      { $set: { temp: null, history: [...history, temp] } }
    );
    res.send(data);
  }
});

app.get("/whatsup", async (req, res) => {
  const db = await wmdb(uri);
  const collection = await db.collection("wmcollection");
  const arr = [...(await collection.find({}).toArray())];
  res.send(
    arr.map((door) => ({
      户号: door.door,
      历史: door.history
        .sort((a, b) => a.ts - b.ts)
        .map((sub) => ({
          读数: sub.val,
          时间: new Date(sub.ts * 1000).toLocaleString("zh-CN"),
        })),
    }))
  );
});

app.get("/allraw", async (req, res) => {
  const db = await wmdb(uri);
  const collection = await db.collection("wmcollection");
  res.send(await collection.find({}).toArray());
});

app.listen(4040, () => {
  console.log("started");
});
