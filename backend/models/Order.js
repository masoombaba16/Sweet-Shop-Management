const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  sweetId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweet" },
  name: String,
  price: Number,
  quantity: Number
});

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  items: [orderItemSchema],
  total: Number,
  status: { type: String, enum: ["PENDING","CONFIRMED","PREPARING","READY","OUT_FOR_DELIVERY","DELIVERED","CANCELLED"], default: "PENDING" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
