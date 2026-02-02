import app from "./app.js";
import http from "http";
import connectDB from "./config/db.js";
import { initSocket } from "./socket.js";


connectDB();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize socket
initSocket(server);

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  process.exit(1);
});


server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
