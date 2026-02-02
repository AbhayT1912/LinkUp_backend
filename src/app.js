import dotenv from "dotenv";
dotenv.config();
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import storyRoutes from "./routes/story.routes.js";
import highlightRoutes from "./routes/highlight.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import messageRoutes from "./routes/message.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

import errorHandler, {
  notFound,
} from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.set("trust proxy", 1);


/* Health Check */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LinkUp backend is running 🚀",
  });
});

// Security headers
app.use(helmet());

// CORS - Allow frontend on 3000, 3001, 3002 (fallback ports)
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

// Rate limiting (basic DDOS protection)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // per IP
});

app.use(limiter);


/* Auth Routes */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/highlights", highlightRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
/* Swagger Docs */
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);




/* Error Middlewares */
app.use(notFound);
app.use(errorHandler);

export default app;
