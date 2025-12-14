// backend/server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

dotenv.config();

const authRoutes = require("./routes/auth");
const sweetsRoutes = require("./routes/sweets");
const categoriesRoutes = require("./routes/categories");
const ordersRoutes = require("./routes/orders");
const customersRoutes = require("./routes/customers");
const sweetRoutes = require("./routes/sweets");

const app = express();
app.use(cors());
// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies (forms)
app.use(express.urlencoded({ extended: true }));
app.use("/api/sweets", sweetRoutes);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/sweets", sweetsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/checkout", require("./routes/checkout"));
app.use("/api/cart", require("./routes/cart"));

// health
app.get("/", (req, res) => res.json({ ok: true }));

const server = http.createServer(app);

// socket.io with permissive CORS for dev (adjust in prod)
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  socket.on("get-sweets", async () => {
    try {
      const Sweet = require("./models/Sweet"); // adjust path
      const sweets = await Sweet.find();
      socket.emit("sweets-update", sweets);
    } catch (err) {
      socket.emit("sweets-error", "Failed to load sweets");
    }
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected:", socket.id);
  });
});


app.set("io", io);


const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 4000;
if (!MONGODB_URI) {
  console.error("❌ Missing MONGODB_URI in .env");
  process.exit(1);
}

// Connect DB THEN start server
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down...");
  try { await mongoose.disconnect(); } catch {}
  process.exit(0);
});
