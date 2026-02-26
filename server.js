import dotenv from "dotenv";

// Load environment variables FIRST (before other imports)
dotenv.config();

import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initializeSocket } from "./src/config/socket.js";

// Connect to database
connectDB();

// Start server
const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

// Initialize Socket.io on the generic active HTTP server wrapper
initializeSocket(httpServer);

const server = httpServer.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});
