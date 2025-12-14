const express = require("express");
const router = express.Router();
const { authenticate, requireAdmin } = require("../middlewares/auth");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const User = require("../models/User"); 

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

router.get("/", authenticate, requireAdmin, async (req, res) => {
  const orders = await Order.find()
    .populate("customer")
    .sort({ createdAt: -1 });

  res.json(orders);
});

router.get(
  "/all-users",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const users = await User.find(
        { "orders.0": { $exists: true } }, 
        { name: 1, email: 1, orders: 1 }
      ).lean();

      const allOrders = users.flatMap(user =>
        (user.orders || []).map(order => ({
          orderId: order.orderId,
          address: order.address,
          items: order.items,
          subtotal: order.subtotal,
          createdAt: order.createdAt,
          userName: user.name,
          userEmail: user.email
        }))
      );

      allOrders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      res.json(allOrders);
    } catch (err) {
      console.error("FETCH ALL USER ORDERS ERROR:", err);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  }
);

router.get("/:id", authenticate, requireAdmin, async (req, res) => {
  const o = await Order.findById(req.params.id).populate("customer");
  if (!o) return res.status(404).json({ message: "Not found" });
  res.json(o);
});

router.post("/:id/status", authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const o = await Order.findById(req.params.id);
  if (!o) return res.status(404).json({ message: "Not found" });

  o.status = status;
  await o.save();
  res.json(o);
});

module.exports = router;
