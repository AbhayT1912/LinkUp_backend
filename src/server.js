import app from "./app.js";
import http from "http";
import connectDB from "./config/db.js";
import { initSocket } from "./socket.js";

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize socket
initSocket(server);

// Start server FIRST
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);

  // Connect DB AFTER server is live
  connectDB();
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});
