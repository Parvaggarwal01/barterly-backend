import * as categoryService from "../services/category.service.js";
import { successResponse } from "../utils/apiResponse.utils.js";

/**
 * Create a new category
 * POST /api/categories
 */
export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);

    return successResponse(
      res,
      201,
      "Category created successfully",
      category,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all categories
 * GET /api/categories
 */
export const getAllCategories = async (req, res, next) => {
  try {
    const filters = {
      isActive: req.query.isActive,
    };

    const categories = await categoryService.getAllCategories(filters);

    return successResponse(
      res,
      200,
      "Categories retrieved successfully",
      categories,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by ID
 * GET /api/categories/:id
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);

    return successResponse(
      res,
      200,
      "Category retrieved successfully",
      category,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by slug
 * GET /api/categories/slug/:slug
 */
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);

    return successResponse(
      res,
      200,
      "Category retrieved successfully",
      category,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update category
 * PUT /api/categories/:id
 */
export const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(
      req.params.id,
      req.body,
    );

    return successResponse(
      res,
      200,
      "Category updated successfully",
      category,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete category
 * DELETE /api/categories/:id
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);

    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle category status
 * PATCH /api/categories/:id/toggle-status
 */
export const toggleCategoryStatus = async (req, res, next) => {
  try {
    const category = await categoryService.toggleCategoryStatus(req.params.id);

    return successResponse(
      res,
      200,
      "Category status updated successfully",
      category,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get category statistics
 * GET /api/categories/admin/stats
 */
export const getCategoryStats = async (req, res, next) => {
  try {
    const stats = await categoryService.getCategoryStats();

    return successResponse(
      res,
      200,
      "Category statistics retrieved successfully",
      stats,
    );
  } catch (error) {
    next(error);
  }
};
