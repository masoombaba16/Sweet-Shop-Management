const express = require("express");
const crypto = require("crypto");
const sendMail = require("../utils/mailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
const { authenticate } = require("../middlewares/auth");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const router = express.Router();

router.put("/profile", authenticate, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let passwordChanged = false;

    if (name) user.name = name;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
      passwordChanged = true;
    }

    await user.save();

    if (user.email && user.email.includes("@")) {
      await sendMail({
        to: user.email,
        subject: "Your Sweet Shop account was updated",
        html: `
          <h3>Account Updated</h3>
          <p>Hello ${user.name},</p>
          <p>Your account details were successfully updated.</p>
          <ul>
            <li>Name changed: ${name ? "Yes" : "No"}</li>
            <li>Password changed: ${passwordChanged ? "Yes" : "No"}</li>
          </ul>
          <p>If this wasn’t you, please reset your password immediately.</p>
          <br/>
          <p>— Sweet Shop Team 🍬</p>
        `,
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  user.forgotPasswordOtp = hashedOtp;
  user.forgotPasswordOtpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendMail({
    to: email,
    subject: "Password Reset OTP",
    html: `<h2>Your OTP: ${otp}</h2><p>Valid for 10 minutes</p>`,
  });

  res.json({ message: "OTP sent" });
});

router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const hashedOtp = crypto
    .createHash("sha256")
    .update(otp.toString())
    .digest("hex");

  const user = await User.findOne({
    email,
    forgotPasswordOtp: hashedOtp,
    forgotPasswordOtpExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.forgotPasswordOtp = undefined;
  user.forgotPasswordOtpExpires = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
});

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "USER",
  });

  await sendMail({
    to: email,
    subject: "Welcome to Sweet Shop 🍬",
    html: `<h2>Welcome ${name}!</h2><p>Your account is ready.</p>`,
  });

  res.status(201).json({
    message: "Registration successful. Confirmation email sent.",
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

module.exports = router;
