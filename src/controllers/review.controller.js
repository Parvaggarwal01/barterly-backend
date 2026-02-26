import * as reviewService from "../services/review.service.js";
import { successResponse } from "../utils/apiResponse.utils.js";

/**
 * Create a review for a completed barter
 * POST /api/reviews
 */
export const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.body, req.user._id);

    return successResponse(res, 201, "Review submitted successfully", review);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reviews for a specific user (public)
 * GET /api/reviews/user/:userId
 */
export const getUserReviews = async (req, res, next) => {
  try {
    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };

    const result = await reviewService.getUserReviews(
      req.params.userId,
      options,
    );

    return successResponse(res, 200, "Reviews retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

/**
 * Check if current user has reviewed a specific barter
 * GET /api/reviews/check/:barterId
 */
export const checkReviewStatus = async (req, res, next) => {
  try {
    const result = await reviewService.checkReviewStatus(
      req.params.barterId,
      req.user._id,
    );

    return successResponse(res, 200, "Review status retrieved", result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get reviews written by the current user
 * GET /api/reviews/my
 */
export const getMyReviews = async (req, res, next) => {
  try {
    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };

    const result = await reviewService.getMyReviews(req.user._id, options);

    return successResponse(
      res,
      200,
      "Your reviews retrieved successfully",
      result,
    );
  } catch (error) {
    next(error);
  }
};
