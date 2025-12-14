// backend/routes/customers.js
const express = require("express");
const Customer = require("../models/Customer");
const { authenticate, requireAdmin } = require("../middlewares/auth");
const router = express.Router();
const User = require("../models/User");
router.get("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const customers = await User.find(
      { role: "USER" },          // only customers
      { password: 0 }            // exclude password
    )
      .sort({ createdAt: -1 })
      .lean();

    res.json(customers);
  } catch (err) {
    console.error("FETCH CUSTOMERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
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
