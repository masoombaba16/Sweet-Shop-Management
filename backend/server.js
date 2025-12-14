const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

dotenv.config();

/* =========================
   BASIC ENV CHECK
========================= */
if (!process.env.MONGODB_URI) {
  console.error("❌ Missing MONGODB_URI");
  process.exit(1);
}

/* =========================
   APP SETUP
========================= */
const app = express();

/* ---------- ALLOW ALL ORIGINS (REST) ---------- */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/auth", require("./routes/auth"));
app.use("/api/sweets", require("./routes/sweets"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/checkout", require("./routes/checkout"));
app.use("/api/cart", require("./routes/cart"));

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Sweet Shop Backend Running" });
});

/* =========================
   SERVER + SOCKET.IO
========================= */
const server = http.createServer(app);

/* ---------- ALLOW ALL ORIGINS (SOCKET.IO) ---------- */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("get-sweets", async () => {
    try {
      const Sweet = require("./models/Sweet");
      const sweets = await Sweet.find();
      socket.emit("sweets-update", sweets);
    } catch (err) {
      console.error("❌ Socket sweets error:", err);
      socket.emit("sweets-error", "Failed to load sweets");
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

app.set("io", io);

/* =========================
   DATABASE + START
========================= */
const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

/* =========================
   GRACEFUL SHUTDOWN
========================= */
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down server...");
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(0);
});
