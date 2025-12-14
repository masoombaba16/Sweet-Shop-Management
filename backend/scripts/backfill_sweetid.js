const mongoose = require("mongoose");
require("dotenv").config();
const Sweet = require("../models/Sweet");
const Counter = require("../models/Counter");

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const maxDoc = await Sweet.findOne({ sweetId: { $exists: true } }).sort({ sweetId: -1 }).select("sweetId").lean();
  let startSeq = (maxDoc && maxDoc.sweetId) ? maxDoc.sweetId : 0;

  await Counter.findOneAndUpdate(
    { name: "sweetId" },
    { $set: { seq: startSeq } },
    { upsert: true }
  );
  console.log("Counter seeded to", startSeq);

  const cursor = Sweet.find({ sweetId: { $exists: false } }).sort({ createdAt: 1 }).cursor();
  let seq = startSeq;
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    seq++;
    await Sweet.findByIdAndUpdate(doc._id, { $set: { sweetId: seq } });
    if (seq % 50 === 0) console.log("Assigned up to", seq);
  }

  await Counter.findOneAndUpdate({ name: "sweetId" }, { $set: { seq } }, { upsert: true });
  console.log("Backfill complete. Final seq =", seq);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error("Backfill error:", err);
  process.exit(1);
});
