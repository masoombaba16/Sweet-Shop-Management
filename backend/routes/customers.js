// backend/routes/customers.js
const express = require("express");
const Customer = require("../models/Customer");
const { authenticate, requireAdmin } = require("../middlewares/auth");
const router = express.Router();

// list (admin)
router.get("/", authenticate, requireAdmin, async (req, res) => {
  const q = req.query.q;
  const filter = {};
  if (q) filter.$or = [{ email: { $regex: q, $options: "i" } }, { name: { $regex: q, $options: "i" } }];
  const customers = await Customer.find(filter).sort({ createdAt: -1 });
  res.json(customers);
});

// update (admin)
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  const c = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(c);
});

// deactivate / ban
router.post("/:id/deactivate", authenticate, requireAdmin, async (req, res) => {
  const c = await Customer.findById(req.params.id);
  if (!c) return res.status(404).json({ message: "Not found" });
  c.active = false;
  await c.save();
  res.json(c);
});

router.post("/:id/ban", authenticate, requireAdmin, async (req, res) => {
  const c = await Customer.findById(req.params.id);
  if (!c) return res.status(404).json({ message: "Not found" });
  c.banned = true;
  await c.save();
  res.json(c);
});

module.exports = router;
