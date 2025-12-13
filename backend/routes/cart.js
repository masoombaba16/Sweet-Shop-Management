const express = require("express");
const Cart = require("../models/Cart");
const Sweet = require("../models/Sweet");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

/**
 * GET cart
 */
router.get("/", authenticate, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate("items.sweet");
  res.json(cart || { items: [] });
});

/**
 * ADD TO CART
 */
router.post("/add", authenticate, async (req, res) => {
  const { sweetId, grams } = req.body;

  if (!sweetId || grams < 200) {
    return res.status(400).json({ message: "Invalid quantity" });
  }

  const sweet = await Sweet.findById(sweetId);
  if (!sweet) return res.status(404).json({ message: "Sweet not found" });

  const maxGrams = sweet.quantity * 1000;
  if (grams > maxGrams) {
    return res.status(400).json({ message: "Quantity exceeds stock" });
  }

  const totalPrice = ((grams / 1000) * sweet.price).toFixed(2);

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  const existing = cart.items.find(
    (i) => i.sweet.toString() === sweetId
  );

  if (existing) {
    existing.grams = grams;
    existing.totalPrice = totalPrice;
  } else {
    cart.items.push({
      sweet: sweetId,
      grams,
      pricePerKg: sweet.price,
      totalPrice
    });
  }

  await cart.save();
  res.json(cart);
});

/**
 * REMOVE ITEM
 */
router.delete("/:sweetId", authenticate, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.json({ items: [] });

  cart.items = cart.items.filter(
    (i) => i.sweet.toString() !== req.params.sweetId
  );

  await cart.save();
  res.json(cart);
});

module.exports = router;
