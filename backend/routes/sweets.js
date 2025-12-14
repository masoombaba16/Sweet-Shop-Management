// backend/routes/sweets.js
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const Sweet = require("../models/Sweet");
const Counter = require("../models/Counter");
const { authenticate, requireAdmin } = require("../middlewares/auth");
const sweetController = require("../controllers/sweetController");
const router = express.Router();


const storage = multer.memoryStorage();
const upload = multer({ storage });

function getBucket() {
  const db = mongoose.connection.db;
  return new mongoose.mongo.GridFSBucket(db, { bucketName: "images" });
}

router.post(
  "/",
  authenticate,
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      // 🔴 Image is mandatory
      if (!req.file) {
        return res.status(400).json({ message: "Image is required" });
      }

      // 🔹 Auto-increment SweetId
      const counter = await Counter.findOneAndUpdate(
        { name: "sweetId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const bucket = getBucket();

      // 🔹 Upload image to GridFS
      const uploadStream = bucket.openUploadStream(
        req.file.originalname,
        { contentType: req.file.mimetype }
      );

      uploadStream.end(req.file.buffer);

      uploadStream.on("finish", async () => {
        const imageId = uploadStream.id; // ✅ GridFS file ID

        const sweet = new Sweet({
          sweetId: counter.seq,
          name: req.body.name,
          category: req.body.category,
          description: req.body.description,
          price: Number(req.body.price),
          cost: Number(req.body.cost || 0),
          quantity: Number(req.body.quantity),
          tags: req.body.tags
            ? req.body.tags.split(",").map(t => t.trim())
            : [],
          visible: true,
          lowStockThreshold: Number(req.body.lowStockThreshold || 5),

          // 🔥 IMPORTANT
          imageUrl: `/api/sweets/uploads/${imageId.toString()}`
        });

        await sweet.save();

        // 🔹 Emit socket event
        const io = req.app.get("io");
        if (io) io.emit("sweet_created", sweet);

        return res.status(201).json(sweet);
      });

      uploadStream.on("error", (err) => {
        console.error("GridFS upload error:", err);
        return res.status(500).json({ message: "Image upload failed" });
      });

    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ message: "Duplicate name or SweetId" });
      }
      console.error("Create sweet error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);


router.post(
  "/upload-image",
  authenticate,
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const bucket = getBucket();
      const filename = `${Date.now()}-${req.file.originalname}`;

      const uploadStream = bucket.openUploadStream(filename, {
        contentType: req.file.mimetype,
        metadata: {
          originalName: req.file.originalname,
          uploadedBy: req.user?.id || null,
        },
      });

      uploadStream.end(req.file.buffer);

      uploadStream.on("finish", () => {
        const fileId = uploadStream.id?.toString();
        const imageUrl = `/api/sweets/uploads/${fileId}`;
        res.json({ imageUrl, fileId });
      });

      uploadStream.on("error", (err) => {
        console.error("GridFS upload error:", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Upload failed" });
        }
      });
    } catch (err) {
      console.error("Upload endpoint error:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Server error" });
      }
    }
  }
);

router.get("/uploads/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const bucket = getBucket();
    const _id = new mongoose.Types.ObjectId(id);

    const filesColl = mongoose.connection.db.collection("images.files");
    const fileDoc = await filesColl.findOne({ _id });
    if (!fileDoc) {
      return res.status(404).json({ message: "File not found" });
    }

    res.setHeader(
      "Content-Type",
      fileDoc.contentType || "application/octet-stream"
    );

    bucket.openDownloadStream(_id).pipe(res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error" });
    }
  }
});

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
router.get("/by-sweet-id/:sweetId", async (req, res) => {
  try {
    const sweetId = Number(req.params.sweetId);

    if (!Number.isFinite(sweetId)) {
      return res.status(400).json({ message: "Invalid sweetId" });
    }

    const sweet = await Sweet.findOne({ sweetId });

    if (!sweet) {
      return res.status(404).json({ message: "Sweet not found" });
    }

    res.json(sweet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put(
  "/product/:id",
  authenticate,
  upload.single("image"),
  async (req, res) => {
    try {
      const sweet = await Sweet.findById(req.params.id);
      if (!sweet) {
        return res.status(404).json({ message: "Sweet not found" });
      }

      // update fields
      sweet.name = req.body.name;
      sweet.price = Number(req.body.price);
      sweet.quantity = Number(req.body.quantity);
      sweet.description = req.body.description;
      sweet.category = req.body.category;
      sweet.tags = req.body.tags
        ? req.body.tags.split(",").map(t => t.trim())
        : [];

      if (req.file) {
        const bucket = getBucket();

        const uploadStream = bucket.openUploadStream(
          req.file.originalname,
          { contentType: req.file.mimetype }
        );

        uploadStream.end(req.file.buffer);

        uploadStream.on("finish", async () => {
          // ✅ CORRECT GRIDFS FILE ID ACCESS
          const fileId = uploadStream.id;

          sweet.imageUrl = `/api/sweets/uploads/${fileId.toString()}`;

          await sweet.save();

          req.app.get("io").emit(
            "sweets-update",
            await Sweet.find({ visible: true })
          );

          return res.json({ ok: true });
        });

        uploadStream.on("error", (err) => {
          console.error("GridFS upload error:", err);
          return res.status(500).json({ message: "Image upload failed" });
        });

      } else {
        await sweet.save();

        req.app.get("io").emit(
          "sweets-update",
          await Sweet.find({ visible: true })
        );

        return res.json({ ok: true });
      }

    } catch (err) {
      console.error("EDIT SWEET ERROR:", err);
      return res.status(500).json({ message: "Failed to update sweet" });
    }
  }
);



router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const sweet = await Sweet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!sweet) {
      return res.status(404).json({ message: "Not found" });
    }

    const io = req.app.get("io");
    if (io) io.emit("sweet_updated", sweet);

    res.json(sweet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const sweet = await Sweet.findByIdAndDelete(req.params.id);
    if (!sweet) {
      return res.status(404).json({ message: "Not found" });
    }

    const io = req.app.get("io");
    if (io) io.emit("sweet_deleted", sweet._id);

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/restock", authenticate, requireAdmin, async (req, res) => {
  const { quantity } = req.body;

  const sweet = await Sweet.findById(req.params.id);
  if (!sweet) {
    return res.status(404).json({ message: "Sweet not found" });
  }

  sweet.quantity += Number(quantity);
  await sweet.save();

  const io = req.app.get("io");
  if (io) io.emit("sweet_updated", sweet);

  res.json(sweet);
});

router.put("/:id/stock", async (req, res) => {
  const { delta } = req.body;

  const sweet = await Sweet.findById(req.params.id);
  if (!sweet) return res.status(404).json({ message: "Sweet not found" });

  sweet.quantity = Math.max(0, sweet.quantity + delta);
  await sweet.save();

  req.app.get("io").emit(
    "sweets-update",
    await Sweet.find({ visible: true })
  );

  res.json({ ok: true });
});

router.post("/:id/toggle-visible", authenticate, requireAdmin, async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) {
      return res.status(404).json({ message: "Not found" });
    }

    sweet.visible = !sweet.visible;
    await sweet.save();

    const io = req.app.get("io");
    if (io) io.emit("sweet_updated", sweet);

    res.json(sweet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/:id/quantity", sweetController.getSweetQuantity);


router.post("/:id/purchase", authenticate, async (req, res) => {
  const sweet = await Sweet.findById(req.params.id);
  if (!sweet || sweet.quantity <= 0) {
    return res.status(400).json({ message: "Out of stock" });
  }

  sweet.quantity -= 1;
  await sweet.save();

  const io = req.app.get("io");
  if (io) io.emit("sweet_updated", sweet);

  res.json(sweet);
});

module.exports = router;
