const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  sweet: { type: mongoose.Schema.Types.ObjectId, ref: "Sweet", required: true },
  grams: { type: Number, required: true },
  pricePerKg: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    items: [cartItemSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
