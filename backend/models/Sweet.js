const mongoose = require("mongoose");

const sweetSchema = new mongoose.Schema({
  sweetId: { type: Number, unique: true },  // <-- sequential unique number
  name: { type: String, required: true, unique: true },
  category: { type: String, default: "general" },
  description: String,
  price: { type: Number, required: true },
  cost: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },   // ensures quantity is always present
  imageUrl: String,
  tags: [String],
  visible: { type: Boolean, default: true },
  lowStockThreshold: { type: Number, default: 5 }
}, { timestamps: true });

module.exports = mongoose.model("Sweet", sweetSchema);
