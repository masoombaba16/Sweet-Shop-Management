const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    sweetId: {
      type: Number,
      required: true
    },
    name: {
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
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    items: {
      type: [orderItemSchema],
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      unique: true
    },

    password: String,

    role: {
      type: String,
      default: "USER"
    },

    forgotPasswordOtp: String,
    forgotPasswordOtpExpires: Date,
    orders: {
      type: [orderSchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
