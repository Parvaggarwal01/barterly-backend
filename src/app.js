import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

// Import models (register with Mongoose early)
import "./models/User.model.js";
import "./models/Category.model.js";
import "./models/Skill.model.js";
import "./models/Review.model.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import skillRoutes from "./routes/skill.routes.js";
import categoryRoutes from "./routes/category.routes.js";

// Import middlewares
import {
  errorHandler,
  notFound,
} from "./middlewares/errorHandler.middleware.js";
import { mongoSanitizeMiddleware } from "./middlewares/mongoSanitize.middleware.js";

const app = express();

// ============ SECURITY MIDDLEWARE ============

// Helmet - Set security HTTP headers
app.use(helmet());

// CORS - Cross-Origin Resource Sharing
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for general API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
// Custom middleware for Express 5 compatibility
app.use(mongoSanitizeMiddleware);

// Prevent HTTP Parameter Pollution
app.use(hpp());

// ============ ROUTES ============

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/categories", categoryRoutes);

// Apply general rate limiter to all other API routes
app.use("/api", apiLimiter);

// ============ ERROR HANDLING ============

// Handle 404 - Route not found
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
