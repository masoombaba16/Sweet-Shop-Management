// backend/routes/auth.js
const express = require("express");
const crypto = require("crypto");
const sendMail = require("../utils/mailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const router = express.Router();

// register
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedOtp = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  user.forgotPasswordOtp = hashedOtp;
  user.forgotPasswordOtpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

  await user.save();

  // send email (already working)
await sendMail(
    email,
    "Password Reset OTP",
    `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; padding: 20px; }
            .email-container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #ff6b6b, #ff8e8e); color: white; padding: 30px; text-align: center; }
            .logo { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
            .content { padding: 40px 30px; text-align: center; }
            h3 { color: #333; font-size: 24px; margin-bottom: 16px; font-weight: 600; }
            h2 { font-size: 52px; font-weight: 800; color: #ff6b6b; letter-spacing: 8px; font-family: 'Courier New', monospace; background: #fff5f5; padding: 20px; border-radius: 12px; margin: 24px 0; }
            p { color: #666; font-size: 16px; margin: 16px 0; line-height: 1.5; }
            @media (max-width: 480px) { h2 { font-size: 42px; letter-spacing: 4px; } }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">🍭 Sweet Shop</div>
            </div>
            <div class="content">
                <h3>Your OTP</h3>
                <h2>\${otp}</h2>
                <p>Valid for 10 minutes</p>
                <p>Sweet Shop Management System | © 2025 Incubyte Assessment</p>
            </div>
        </div>
    </body>
    </html>
    `
);

  res.json({ message: "OTP sent" });
});
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "All fields required" });
  }

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
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "USER"
    });

    // ✅ SEND CONFIRMATION EMAIL
await sendMail(
    email,
    "Welcome to Sweet Shop 🍬",
    `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; padding: 20px; }
            .email-container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #ff6b6b, #ff8e8e); color: white; padding: 40px 30px; text-align: center; }
            .logo { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
            .content { padding: 40px 30px; text-align: left; }
            h2 { color: #333; font-size: 24px; margin-bottom: 20px; font-weight: 600; }
            p { color: #666; font-size: 16px; margin: 16px 0; line-height: 1.6; }
            .highlight { color: #ff6b6b; font-size: 18px; font-weight: 500; }
            .team { background: #fff5f5; padding: 20px; border-radius: 8px; text-align: center; margin-top: 30px; border-left: 4px solid #ff6b6b; }
            .footer { background: #333; color: #ccc; padding: 20px; text-align: center; font-size: 14px; }
            @media (max-width: 480px) { .content { padding: 30px 20px; } }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">🍭 Sweet Shop</div>
                <h1 style="font-size: 24px; margin: 0;">Welcome Aboard!</h1>
            </div>
            <div class="content">
                <h2>Hi \${name},</h2>
                <p class="highlight">🎉 Your account has been created successfully.</p>
                <p>You can now login and explore delicious sweets!</p>
                <br/>
                <div class="team">
                    <p><b>Sweet Shop Team</b></p>
                </div>
            </div>
            <div class="footer">
                <p>Sweet Shop Management System | © 2025 Incubyte Assessment</p>
            </div>
        </div>
    </body>
    </html>
    `
);


    res.status(201).json({
      message: "Registration successful. Confirmation email sent."
    });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const body = req.body || {};
    const { email, password } = body;
    if (!email || !password) return res.status(400).json({ message: "Email & password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
