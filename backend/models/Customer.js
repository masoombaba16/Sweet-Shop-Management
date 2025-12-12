// backend/models/Customer.js
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  phone: String,
  address: String,
  active: { type: Boolean, default: true },
  banned: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);
