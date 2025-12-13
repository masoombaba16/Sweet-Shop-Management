exports.getSweetQuantity = async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id).select("quantity");
    if (!sweet) {
      return res.status(404).json({ message: "Sweet not found" });
    }

    res.json({ quantity: sweet.quantity }); // quantity in KG
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch quantity" });
  }
};
