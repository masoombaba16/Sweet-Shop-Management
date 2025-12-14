const mongoose = require("mongoose");
require("dotenv").config();
const Sweet = require("../models/Sweet");

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to Mongo");

  const docs = await Sweet.find({ imageUrl: { $regex: '^/uploads/' } }).lean();
  console.log("Found", docs.length, "docs to update");

  for (const d of docs) {
    const old = d.imageUrl;
    const id = old.split("/").pop();
    const updated = `/api/sweets/uploads/${id}`;
    await Sweet.updateOne({ _id: d._id }, { $set: { imageUrl: updated }});
    console.log("Updated", d._id.toString(), "->", updated);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
