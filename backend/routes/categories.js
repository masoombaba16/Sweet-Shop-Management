// backend/routes/categories.js
const express = require("express");
const Category = require("../models/Category");
const { authenticate, requireAdmin } = require("../middlewares/auth");
const router = express.Router();

// create
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const c = await Category.create(req.body);
    res.status(201).json(c);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Category exists" });
    res.status(500).json({ message: "Server error" });
  }
});

// list
router.get("/", async (req, res) => {
  const cats = await Category.find().sort({ order: 1 });
  res.json(cats);
});

// update
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  const c = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(c);
});

// delete
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;
