// backend/routes/sweets.js
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const Sweet = require("../models/Sweet");
const { authenticate, requireAdmin } = require("../middlewares/auth");

const router = express.Router();
const Counter = require("../models/Counter");

// multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// helper to get GridFSBucket - ensure mongoose is connected
function getBucket() {
  const db = mongoose.connection.db;
  return new mongoose.mongo.GridFSBucket(db, { bucketName: "images" });
}

// Create sweet (admin) - assigns sequential sweetId
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    // atomically increment counter for sweetId
    const counter = await Counter.findOneAndUpdate(
      { name: "sweetId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const payload = {
      sweetId: counter.seq,
      ...req.body
    };

    const s = await Sweet.create(payload);
    res.status(201).json(s);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Duplicate name or SweetId" });
    console.error("Create sweet error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Image upload (admin) - multipart/form-data -> stores in GridFS and returns imageUrl (GridFS id)
router.post("/upload-image", authenticate, requireAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const bucket = getBucket();
    const filename = `${Date.now()}-${req.file.originalname}`;
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: req.file.mimetype,
      metadata: { originalName: req.file.originalname, uploadedBy: req.user?.id || null }
    });

    // write buffer and end stream
    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", () => {
      try {
        const fileIdObj = uploadStream.id; // ObjectId
        const fileId = fileIdObj ? fileIdObj.toString() : null;
        // IMPORTANT: serve images at /api/sweets/uploads/:id (router is mounted at /api/sweets)
        const imageUrl = fileId ? `/api/sweets/uploads/${fileId}` : null;
        return res.json({ imageUrl, fileId });
      } catch (e) {
        console.error("Error after upload finish:", e);
        return res.status(500).json({ message: "Upload completed but response failed" });
      }
    });


    uploadStream.on("error", (err) => {
      console.error("GridFS upload error:", err);
      // If headers already sent, just log
      if (!res.headersSent) return res.status(500).json({ message: "Upload failed" });
    });
  } catch (err) {
    console.error("Upload endpoint error:", err);
    if (!res.headersSent) res.status(500).json({ message: "Server error" });
  }
});

// Serve image by GridFS file id
router.get("/uploads/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid id" });

    const bucket = getBucket();
    const _id = new mongoose.Types.ObjectId(id);

    // find file info to set headers
    const filesColl = mongoose.connection.db.collection("images.files");
    const fileDoc = await filesColl.findOne({ _id });
    if (!fileDoc) return res.status(404).json({ message: "File not found" });

    // Set content-type if available
    if (fileDoc.contentType) res.setHeader("Content-Type", fileDoc.contentType);
    else {
      const ext = path.extname(fileDoc.filename || "").toLowerCase();
      if (ext === ".png") res.setHeader("Content-Type", "image/png");
      else if (ext === ".jpg" || ext === ".jpeg") res.setHeader("Content-Type", "image/jpeg");
      else if (ext === ".gif") res.setHeader("Content-Type", "image/gif");
      else res.setHeader("Content-Type", "application/octet-stream");
    }

    const downloadStream = bucket.openDownloadStream(_id);
    downloadStream.on("error", (err) => {
      console.error("GridFS download error:", err);
      if (!res.headersSent) res.status(500).end();
    });
    downloadStream.pipe(res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ message: "Server error" });
  }
});

// List with filters
router.get("/", async (req, res) => {
  try {
    const { q, category, tag, minPrice, maxPrice, visible, inStock } = req.query;
    const filter = {};
    if (q) filter.name = { $regex: q, $options: "i" };
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    if (visible !== undefined) filter.visible = visible === "true";
    if (inStock === "true") filter.quantity = { $gt: 0 };
    const sweets = await Sweet.find(filter).sort({ createdAt: -1 });
    res.json(sweets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Single
router.get("/:id", async (req, res) => {
  try {
    const s = await Sweet.findById(req.params.id);
    if (!s) return res.status(404).json({ message: "Not found" });
    res.json(s);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update (admin)
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const s = await Sweet.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!s) return res.status(404).json({ message: "Not found" });
    res.json(s);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete (admin)
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const s = await Sweet.findByIdAndDelete(req.params.id);
    if (!s) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Restock (admin)
router.post("/:id/restock", authenticate, requireAdmin, async (req, res) => {
  try {
    const qty = Number(req.body.quantity || 1);
    if (qty <= 0) return res.status(400).json({ message: "Invalid qty" });
    const sweet = await Sweet.findByIdAndUpdate(req.params.id, { $inc: { quantity: qty }}, { new: true });
    if (!sweet) return res.status(404).json({ message: "Not found" });

    const io = req.app.get("io");
    if (io) io.emit("inventory:update", { id: sweet._id, quantity: sweet.quantity });

    res.json({ message: "Restocked", sweet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Toggle visible (admin)
router.post("/:id/toggle-visible", authenticate, requireAdmin, async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ message: "Not found" });
    sweet.visible = !sweet.visible;
    await sweet.save();

    const io = req.app.get("io");
    if (io) io.emit("inventory:visibility", { id: sweet._id, visible: sweet.visible });

    res.json(sweet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Purchase: decrease quantity (protected)
router.post("/:id/purchase", authenticate, async (req, res) => {
  try {
    const qty = Number(req.body.quantity || 1);
    if (qty <= 0) return res.status(400).json({ message: "Invalid quantity" });

    const sweet = await Sweet.findOneAndUpdate(
      { _id: req.params.id, quantity: { $gte: qty } },
      { $inc: { quantity: -qty } },
      { new: true }
    );
    if (!sweet) return res.status(400).json({ message: "Not enough stock or not found" });

    const io = req.app.get("io");
    if (io) {
      io.emit("inventory:update", { id: sweet._id, quantity: sweet.quantity });
      if (sweet.quantity <= sweet.lowStockThreshold) {
        io.emit("inventory:low-stock", { id: sweet._id, quantity: sweet.quantity, threshold: sweet.lowStockThreshold });
      }
      if (sweet.quantity === 0) {
        io.emit("inventory:out-of-stock", { id: sweet._id });
      }
    }

    res.json({ message: "Purchased", sweet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
