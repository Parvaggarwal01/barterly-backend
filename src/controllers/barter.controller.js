import * as barterService from "../services/barter.service.js";
import { successResponse } from "../utils/apiResponse.utils.js";

/**
 * Create a new barter request
 * POST /api/barters
 */
export const createBarterRequest = async (req, res, next) => {
  try {
    const barter = await barterService.createBarterRequest(
      req.body,
      req.user._id,
    );

    return successResponse(
      res,
      201,
      "Barter request sent successfully",
      barter,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's barter requests with filters
 * GET /api/barters/my
 */
export const getMyBarters = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      type: req.query.type || "all",
    };

    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      sortBy: req.query.sortBy || "createdAt",
      order: req.query.order || "desc",
    };

    const result = await barterService.getMyBarters(
      req.user._id,
      filters,
      options,
    );

    return successResponse(
      res,
      200,
      "Barter requests retrieved successfully",
      result,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get single barter request by ID
 * GET /api/barters/:id
 */
export const getBarterById = async (req, res, next) => {
  try {
    const barter = await barterService.getBarterById(
      req.params.id,
      req.user._id,
    );

    return successResponse(
      res,
      200,
      "Barter request retrieved successfully",
      barter,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Accept a barter request
 * PUT /api/barters/:id/accept
 */
export const acceptBarter = async (req, res, next) => {
  try {
    const barter = await barterService.acceptBarter(
      req.params.id,
      req.user._id,
    );

    return successResponse(res, 200, "Barter request accepted", barter);
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a barter request
 * PUT /api/barters/:id/reject
 */
export const rejectBarter = async (req, res, next) => {
  try {
    const barter = await barterService.rejectBarter(
      req.params.id,
      req.user._id,
      req.body.reason,
    );

    return successResponse(res, 200, "Barter request rejected", barter);
  } catch (error) {
    next(error);
  }
};

/**
 * Counter offer on a barter request
 * PUT /api/barters/:id/counter
 */
export const counterOffer = async (req, res, next) => {
  try {
    const barter = await barterService.counterOffer(
      req.params.id,
      req.user._id,
      req.body,
    );

    return successResponse(res, 200, "Counter offer sent successfully", barter);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a barter request
 * PUT /api/barters/:id/cancel
 */
export const cancelBarter = async (req, res, next) => {
  try {
    const barter = await barterService.cancelBarter(
      req.params.id,
      req.user._id,
    );

    return successResponse(res, 200, "Barter request cancelled", barter);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark barter as completed
 * PUT /api/barters/:id/complete
 */
export const completeBarter = async (req, res, next) => {
  try {
    const barter = await barterService.completeBarter(
      req.params.id,
      req.user._id,
    );

    return successResponse(
      res,
      200,
      "Barter marked as completed successfully",
      barter,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get barter statistics for current user
 * GET /api/barters/stats
 */
export const getBarterStats = async (req, res, next) => {
  try {
    const stats = await barterService.getBarterStats(req.user._id);

    return successResponse(res, 200, "Statistics retrieved successfully", stats);
  } catch (error) {
    next(error);
  }
};
