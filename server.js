import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "wit_arcade";
const collectionName = process.env.MONGODB_COLLECTION || "leaderboard";

if (!mongoUri) {
  console.error("Missing MONGODB_URI in .env");
  process.exit(1);
}

let client;
let collection;

async function initDb() {
  client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(dbName);
  collection = db.collection(collectionName);

  await collection.createIndex({ guesses: 1, elapsedSec: 1, createdAt: 1 });
  await collection.createIndex({ email: 1, createdAt: -1 });
}

app.use(express.json());

app.get("/api/leaderboard", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const entries = await collection
      .find({}, { projection: { email: 1, guesses: 1, elapsedSec: 1, createdAt: 1 } })
      .sort({ guesses: 1, elapsedSec: 1, createdAt: 1 })
      .limit(limit)
      .toArray();

    res.json({ entries });
  } catch (err) {
    console.error("Leaderboard fetch failed", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

app.post("/api/leaderboard", async (req, res) => {
  try {
    const { email, guesses, elapsedSec, consent } = req.body || {};

    const emailOk = typeof email === "string" && email.includes("@");
    const guessesOk = Number.isInteger(guesses) && guesses > 0;
    const elapsedOk = Number.isInteger(elapsedSec) && elapsedSec >= 0;

    if (!consent) {
      return res.status(400).json({ error: "Consent required" });
    }
    if (!emailOk || !guessesOk || !elapsedOk) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const entry = {
      email: email.trim().toLowerCase(),
      guesses,
      elapsedSec,
      consent: true,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(entry);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    console.error("Leaderboard insert failed", err);
    res.status(500).json({ error: "Failed to submit score" });
  }
});

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Leaderboard API running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database", err);
    process.exit(1);
  });

process.on("SIGINT", async () => {
  try {
    if (client) await client.close();
  } finally {
    process.exit(0);
  }
});
