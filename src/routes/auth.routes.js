import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations/auth.validation.js";

const router = express.Router();

/**
 * Public routes
 */

// Register new user
router.post("/register", validate(registerSchema), authController.register);

// Login user
router.post("/login", validate(loginSchema), authController.login);

// Verify email with OTP
router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  authController.verifyEmail,
);

// Forgot password
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);

// Reset password
router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  authController.resetPassword,
);

// Refresh access token
router.post("/refresh-token", authController.refreshToken);

/**
 * Protected routes (require authentication)
 */

// Resend verification email
router.post(
  "/resend-verification",
  authenticate,
  authController.resendVerification,
);

// Get current user
router.get("/me", authenticate, authController.getCurrentUser);

// Logout user
router.post("/logout", authenticate, authController.logout);

export default router;
