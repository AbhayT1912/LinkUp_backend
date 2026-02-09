import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

let io;
const onlineUsers = new Map(); // userId -> socketId

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === "production"
        ? "http://localhost:3001/"
        : "*", // tighten in production
    },
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET
      );

      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    onlineUsers.set(userId, socket.id);
    console.log("🟢 User connected:", userId);

    socket.on("typing_start", ({ conversationId, toUserId }) => {
    const receiverSocketId = onlineUsers.get(toUserId?.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing_start", {
        conversationId,
        fromUserId: userId,
      });
    }
  });

  socket.on("typing_stop", ({ conversationId, toUserId }) => {
    const receiverSocketId = onlineUsers.get(toUserId?.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing_stop", {
        conversationId,
        fromUserId: userId,
      });
    }
  });


    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      console.log("🔴 User disconnected:", userId);
    });
  });
};

export const emitNotification = (userId, payload) => {
  const socketId = onlineUsers.get(userId.toString());
  if (socketId && io) {
    io.to(socketId).emit("notification", payload);
  }
};

export const emitMessage = (userId, payload) => {
  const socketId = onlineUsers.get(userId.toString());
  if (socketId && io) {
    io.to(socketId).emit("message", payload);
  }
};

export const emitMessageRead = (userId, payload) => {
  const socketId = onlineUsers.get(userId.toString());
  if (socketId && io) {
    io.to(socketId).emit("message_read", payload);
  }
};

export const emitMessageDelete = (conversationId, payload) => {
  io.emit("message_deleted", payload);
};

