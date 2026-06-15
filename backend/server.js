require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { connectRedis } = require("./src/config/redis");
const { Server } = require("socket.io");
const meetingSocket = require("./src/sockets/meetingSocket");
const chatSocket = require("./src/sockets/chatSocket");

// ── DATABASE ──────────────────────────────────────────────────────────────────
connectDB();
connectRedis();

// ── HTTP SERVER ───────────────────────────────────────────────────────────────
const server = http.createServer(app);

// ── SOCKET.IO ─────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ── SOCKET HANDLERS ───────────────────────────────────────────────────────────
meetingSocket(io);
chatSocket(io);

// ── START ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});

// ── GRACEFUL SHUTDOWN ─────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});