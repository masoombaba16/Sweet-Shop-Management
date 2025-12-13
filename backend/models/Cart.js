const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  sweetId: {
    type: Number,
    required: true
  },
  name: {                     // ✅ ADD THIS
    type: String,
    required: true
  },
  grams: {
    type: Number,
    required: true
  },
  pricePerKg: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  }
});


const cartSchema = new mongoose.Schema(
  {
    user: {   // ✅ MUST BE "user"
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    items: [
      {
        sweetId: { type: Number, required: true },
        name: { type: String, default: "" },
        grams: { type: Number, required: true },
        pricePerKg: { type: Number, required: true },
        totalPrice: { type: Number, required: true }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
