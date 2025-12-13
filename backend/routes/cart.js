const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Sweet = require("../models/Sweet");
const { authenticate } = require("../middlewares/auth");

/* -----------------------------
   GET CART
------------------------------ */
router.get("/", authenticate, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    res.json(cart || { items: [] });
  } catch {
    res.status(500).json({ message: "Failed to fetch cart" });
  }
});

router.post("/add", authenticate, async (req, res) => {
  try {
    const sweetId = Number(req.body.sweetId);
    const grams = Number(req.body.grams);
    const pricePerKg = Number(req.body.pricePerKg);

    if (
      !Number.isFinite(sweetId) ||
      !Number.isFinite(grams) ||
      !Number.isFinite(pricePerKg)
    ) {
      return res.status(400).json({ message: "Invalid cart data" });
    }

    const sweet = await Sweet.findOne({ sweetId });
    if (!sweet) {
      return res.status(404).json({ message: "Sweet not found" });
    }

    const maxGrams = sweet.quantity * 1000;
    if (grams > maxGrams) {
      return res
        .status(400)
        .json({ message: `Only ${maxGrams} grams available` });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({
        user: req.user.id,   // ✅ THIS FIXES user:null
        items: []
      });
    }


    const existing = cart.items.find(i => i.sweetId === sweetId);

    const totalPrice = Number(
      ((grams / 1000) * pricePerKg).toFixed(2)
    );

    if (existing) {
      existing.name = sweet.name;
      existing.grams = grams;
      existing.pricePerKg = pricePerKg;
      existing.totalPrice = totalPrice;
    } else {
      cart.items.push({
        sweetId,
        name: sweet.name,
        grams,
        pricePerKg,
        totalPrice
      });
    }

    await cart.save();
    res.json(cart);

  } catch (err) {
    console.error("CART ADD ERROR:", err);
    res.status(500).json({ message: "Failed to add to cart" });
  }
});

router.put("/update", authenticate, async (req, res) => {
  try {
    const { sweetId, grams } = req.body;
    if (!Number.isFinite(sweetId) || !Number.isFinite(grams)) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(i => i.sweetId === sweetId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const sweet = await Sweet.findOne({ sweetId });
    if (!sweet) {
      return res.status(404).json({ message: "Sweet not found" });
    }

    const maxGrams = sweet.quantity * 1000;
    if (grams > maxGrams) {
      return res.status(400).json({
        message: `Only ${maxGrams} grams available`
      });
    }

    item.grams = grams;
    item.totalPrice = Number(
      ((grams / 1000) * item.pricePerKg).toFixed(2)
    );

    await cart.save();
    res.json(cart);

  } catch (err) {
    console.error("UPDATE CART ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
});



router.delete("/remove/:sweetId", authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.json({ items: [] });

    cart.items = cart.items.filter(
      i => i.sweetId !== Number(req.params.sweetId)
    );

    await cart.save();
    res.json(cart);
  } catch {
    res.status(500).json({ message: "Remove failed" });
  }
});

module.exports = router;
