// backend/routes/orders.js
const express = require("express");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const { authenticate, requireAdmin } = require("../middlewares/auth");
const router = express.Router();

// list orders (admin)
router.get("/", authenticate, requireAdmin, async (req, res) => {
  const orders = await Order.find().populate("customer").sort({ createdAt: -1 });
  res.json(orders);
});

// get order details (admin)
router.get("/:id", authenticate, requireAdmin, async (req, res) => {
  const o = await Order.findById(req.params.id).populate("customer");
  if (!o) return res.status(404).json({ message: "Not found" });
  res.json(o);
});

// update status (admin)
router.post("/:id/status", authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const o = await Order.findById(req.params.id);
  if (!o) return res.status(404).json({ message: "Not found" });
  o.status = status;
  await o.save();
  res.json(o);
});

module.exports = router;
