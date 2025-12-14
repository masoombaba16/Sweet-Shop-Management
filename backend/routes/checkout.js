const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Sweet = require("../models/Sweet");
const sendMail = require("../utils/mailer");

router.post("/send-otp", authenticate, async (req, res) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.forgotPasswordOtp = otp;
    user.forgotPasswordOtpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
    await user.save();

    await sendMail({
      to: user.email,
      subject: "Sweet Shop - Order OTP",
      html: `
        <h2>Order Confirmation OTP</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `
    });

    console.log("📩 OTP sent to:", user.email);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

router.post("/verify-otp", authenticate, async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: "OTP is required" });
  }

  const user = await User.findById(req.user.id);

  if (
    !user ||
    user.forgotPasswordOtp !== otp ||
    user.forgotPasswordOtpExpires < Date.now()
  ) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.forgotPasswordOtp = undefined;
  user.forgotPasswordOtpExpires = undefined;
  await user.save();

  res.json({ message: "OTP verified successfully" });
});

router.post("/place-order", authenticate, async (req, res) => {
  try {
    const { address, name } = req.body;
    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    const user = await User.findById(req.user.id);
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let subtotal = 0;

    for (const item of cart.items) {
      const sweet = await Sweet.findOne({ sweetId: item.sweetId });
      if (!sweet) {
        return res.status(404).json({
          message: `Sweet ${item.name} not found`
        });
      }

      const requiredKg = item.grams / 1000;
      if (sweet.quantity < requiredKg) {
        return res.status(400).json({
          message: `Insufficient stock for ${sweet.name}`
        });
      }

      sweet.quantity -= requiredKg;
      await sweet.save();

      subtotal += item.totalPrice;
    }

    const order = {
      orderId: `ORD-${Date.now()}`,
      address,
      items: cart.items,
      subtotal,
      createdAt: new Date()
    };

    user.orders.push(order);
    await user.save();

    cart.items = [];
    await cart.save();

    const itemsHtml = order.items
      .map(
        i => `
        <tr>
          <td>${i.name}</td>
          <td>${i.grams} g</td>
          <td>₹ ${i.pricePerKg}/kg</td>
          <td>₹ ${i.totalPrice}</td>
        </tr>
      `
      )
      .join("");

    await sendMail({
      to: user.email,
      subject: "Sweet Shop - Order Confirmed 🍬",
      html: `
        <h2>Order Confirmed</h2>
        <p>Hi ${name || user.name},</p>
        <p>Your order <strong>${order.orderId}</strong> has been placed.</p>

        <table border="1" cellpadding="8" cellspacing="0">
          <tr>
            <th>Sweet</th>
            <th>Quantity</th>
            <th>Price/Kg</th>
            <th>Total</th>
          </tr>
          ${itemsHtml}
        </table>

        <h3>Total Amount: ₹ ${subtotal.toFixed(2)}</h3>
        <p><strong>Delivery Address:</strong><br/>${address}</p>

        <p>Thank you for shopping with us! 🎉</p>
      `
    });

    res.json({
      message: "Order placed successfully",
      orderId: order.orderId
    });
  } catch (err) {
    console.error("PLACE ORDER ERROR:", err);
    res.status(500).json({ message: "Failed to place order" });
  }
});

module.exports = router;
