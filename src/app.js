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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// CORS (tighten later)
app.use(
  cors({
    origin: "*",
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
