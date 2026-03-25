import * as authService from "../services/auth.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.utils.js";


export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const result = await authService.registerUser({ name, email, password });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(
      res,
      201,
      "Registration successful. Please check your email to verify your account.",
      {
        user: result.user,
        accessToken: result.accessToken,
      },
    );
  } catch (error) {
    next(error);
  }
};


export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, 200, "Login successful", {
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { otp, email } = req.body;

    const result = await authService.verifyEmail(otp, email);

    return successResponse(res, 200, "Email verified successfully", result);
  } catch (error) {
    next(error);
  }
};


export const resendVerification = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const result = await authService.resendVerificationEmail(userId);

    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};


export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);

    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};


export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const result = await authService.resetPassword(token, password);

    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};


export const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    const tokens = await authService.refreshAccessToken(refreshToken);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return successResponse(res, 200, "Token refreshed successfully", {
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    next(error);
  }
};


export const logout = async (req, res, next) => {
  try {
    await authService.logoutUser();

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    return successResponse(res, 200, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};


export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const result = await authService.getCurrentUser(userId);

    return successResponse(
      res,
      200,
      "User profile retrieved successfully",
      result,
    );
  } catch (error) {
    next(error);
  }
};
