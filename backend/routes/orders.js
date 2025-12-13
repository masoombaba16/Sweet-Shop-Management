const express = require("express");
const router = express.Router();
const { authenticate, requireAdmin } = require("../middlewares/auth");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const User = require("../models/User"); // ✅ FIX

/* ===========================
   USER: MY ORDERS
=========================== */
router.get("/my-orders", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.orders || []);
  } catch (err) {
    console.error("FETCH ORDERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/* ===========================
   ADMIN: LIST ALL ORDERS
=========================== */
router.get("/", authenticate, requireAdmin, async (req, res) => {
  const orders = await Order.find()
    .populate("customer")
    .sort({ createdAt: -1 });

  res.json(orders);
});

/* ===========================
   ADMIN: ORDER DETAILS
=========================== */
router.get("/:id", authenticate, requireAdmin, async (req, res) => {
  const o = await Order.findById(req.params.id).populate("customer");
  if (!o) return res.status(404).json({ message: "Not found" });
  res.json(o);
});

/* ===========================
   ADMIN: UPDATE STATUS
=========================== */
router.post("/:id/status", authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const o = await Order.findById(req.params.id);
  if (!o) return res.status(404).json({ message: "Not found" });

  o.status = status;
  await o.save();
  res.json(o);
});

module.exports = router;
