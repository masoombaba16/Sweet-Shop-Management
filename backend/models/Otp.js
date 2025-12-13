const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  otp: String,
  expiresAt: Date
});

module.exports = mongoose.model("Otp", otpSchema);
