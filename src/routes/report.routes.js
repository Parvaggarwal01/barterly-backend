import express from "express";
import * as reportController from "../controllers/report.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createReportSchema } from "../validations/report.validation.js";

const router = express.Router();

router.use(authenticate);

/**
 * @route   POST /api/reports
 * @desc    Submit a report against a user
 * @access  Private
 */
router.post("/", validate(createReportSchema), reportController.submitReport);

export default router;
