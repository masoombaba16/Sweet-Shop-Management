const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

dotenv.config();

const REQUIRED_ENVS = ["MONGODB_URI", "FRONTEND_URL"];
REQUIRED_ENVS.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing env variable: ${key}`);
    process.exit(1);
  }
});

const app = express();

const allowedOrigins = [process.env.FRONTEND_URL];


app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server or curl requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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
  res.json({ status: "OK", service: "Sweet Shop API" });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
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
      console.error("Socket sweets error:", err);
      socket.emit("sweets-error", "Failed to load sweets");
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

app.set("io", io);

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
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });


process.on("SIGINT", async () => {
  console.log("🛑 Shutting down server...");
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(0);
});
