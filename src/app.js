import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import storyRoutes from "./routes/story.routes.js";
import highlightRoutes from "./routes/highlight.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import messageRoutes from "./routes/message.routes.js";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

import errorHandler, {
  notFound,
} from "./middlewares/error.middleware.js";

const app = express();

/* =========================
   BASIC CONFIG
========================= */
app.set("trust proxy", 1);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(helmet());

/* =========================
   CORS CONFIG
========================= */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* =========================
   RATE LIMITERS
========================= */

// 🔐 STRICT limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // login/register attempts
  standardHeaders: true,
  legacyHeaders: false,
});

// 🌐 GENERAL API limiter (relaxed)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "development" ? 1000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LinkUp backend is running 🚀",
  });
});

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/users", apiLimiter, userRoutes);
app.use("/api/posts", apiLimiter, postRoutes);
app.use("/api/stories", apiLimiter, storyRoutes);
app.use("/api/highlights", apiLimiter, highlightRoutes);
app.use("/api/notifications", apiLimiter, notificationRoutes);
app.use("/api/messages", apiLimiter, messageRoutes);

/* =========================
   SWAGGER DOCS
========================= */
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

/* =========================
   ERROR HANDLING
========================= */
app.use(notFound);
app.use(errorHandler);

export default app;
