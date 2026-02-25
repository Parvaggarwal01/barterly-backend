import crypto from "crypto";
import User from "../models/User.model.js";
import { generateTokens } from "../utils/jwt.utils.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../utils/email.utils.js";
import { AppError } from "../utils/apiResponse.utils.js";

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Object} User object and tokens
 */
export const registerUser = async ({ name, email, password }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  // Generate 6-digit OTP
  const verificationOTP = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();

  // Set OTP expiry to 10 minutes from now
  const verificationOTPExpire = new Date(Date.now() + 10 * 60 * 1000);

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    verificationOTP,
    verificationOTPExpire,
  });

  // Send verification email with OTP
  try {
    await sendVerificationEmail(email, name, verificationOTP);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Continue registration even if email fails
  }

  // Generate tokens
  const tokens = generateTokens(user);

  return {
    user: user.toPublicProfile(),
    ...tokens,
  };
};

/**
 * Login user
 * @param {String} email - User email
 * @param {String} password - User password
 * @returns {Object} User object and tokens
 */
export const loginUser = async (email, password) => {
  // Find user and include password field
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Check if account is active
  if (!user.isActive) {
    throw new AppError(
      "Your account has been deactivated. Please contact support.",
      403,
    );
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // Generate tokens
  const tokens = generateTokens(user);

  return {
    user: user.toPublicProfile(),
    ...tokens,
  };
};

/**
 * Verify user email with OTP
 * @param {String} otp - 6-digit OTP code
 * @param {String} email - User email
 * @returns {Object} User object
 */
export const verifyEmail = async (otp, email) => {
  const user = await User.findOne({ email }).select(
    "+verificationOTP +verificationOTPExpire",
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isVerified) {
    throw new AppError("Email already verified", 400);
  }

  if (!user.verificationOTP || !user.verificationOTPExpire) {
    throw new AppError(
      "No verification OTP found. Please request a new one.",
      400,
    );
  }

  // Check if OTP has expired
  if (user.verificationOTPExpire < Date.now()) {
    throw new AppError("OTP has expired. Please request a new one.", 400);
  }

  // Check if OTP matches
  if (user.verificationOTP !== otp) {
    throw new AppError("Invalid OTP code", 400);
  }

  // Update user
  user.isVerified = true;
  user.verificationOTP = undefined;
  user.verificationOTPExpire = undefined;
  await user.save();

  // Send welcome email
  try {
    await sendWelcomeEmail(user.email, user.name);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }

  return {
    user: user.toPublicProfile(),
  };
};

/**
 * Resend verification OTP
 * @param {String} userId - User ID
 * @returns {Object} Success message
 */
export const resendVerificationEmail = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isVerified) {
    throw new AppError("Email already verified", 400);
  }

  // Generate new 6-digit OTP
  const verificationOTP = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();

  // Set OTP expiry to 10 minutes from now
  const verificationOTPExpire = new Date(Date.now() + 10 * 60 * 1000);

  user.verificationOTP = verificationOTP;
  user.verificationOTPExpire = verificationOTPExpire;
  await user.save();

  // Send verification email with new OTP
  await sendVerificationEmail(user.email, user.name, verificationOTP);

  return {
    message: "Verification OTP sent successfully",
  };
};

/**
 * Request password reset
 * @param {String} email - User email
 * @returns {Object} Success message
 */
export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if email exists or not for security
    return {
      message:
        "If your email is registered, you will receive a password reset link",
    };
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set reset token and expiry (1 hour)
  user.resetPasswordToken = resetTokenHash;
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  // Send reset email
  try {
    await sendPasswordResetEmail(user.email, user.name, resetToken);
  } catch (error) {
    // Revert changes if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    throw new AppError("Failed to send password reset email", 500);
  }

  return {
    message:
      "If your email is registered, you will receive a password reset link",
  };
};

/**
 * Reset password
 * @param {String} token - Reset token
 * @param {String} newPassword - New password
 * @returns {Object} Success message
 */
export const resetPassword = async (token, newPassword) => {
  // Hash the token to compare with stored hash
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // Find user with valid reset token
  const user = await User.findOne({
    resetPasswordToken: resetTokenHash,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpire");

  if (!user) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  // Update password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return {
    message:
      "Password reset successful. You can now login with your new password.",
  };
};

/**
 * Refresh access token
 * @param {String} refreshToken - Refresh token from cookie
 * @returns {Object} New tokens
 */
export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  // Verify refresh token
  let decoded;
  try {
    const { verifyRefreshToken } = await import("../utils/jwt.utils.js");
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // Check if user exists
  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.isActive) {
    throw new AppError("Account deactivated", 403);
  }

  // Generate new tokens
  const tokens = generateTokens(user);

  return tokens;
};

/**
 * Logout user (invalidate refresh token)
 * @returns {Object} Success message
 */
export const logoutUser = async () => {
  // In a real implementation with token blacklisting or session storage,
  // you would invalidate the refresh token here
  // For now, we'll just return success and let the client handle clearing cookies

  return {
    message: "Logged out successfully",
  };
};

/**
 * Get current user profile
 * @param {String} userId - User ID
 * @returns {Object} User object
 */
export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    user: user.toPublicProfile(),
  };
};
