import * as reportService from "../services/report.service.js";
import { successResponse } from "../utils/apiResponse.utils.js";

export const submitReport = async (req, res, next) => {
  try {
    const result = await reportService.createReport(req.body, req.user._id);
    successResponse(res, 201, "Report submitted successfully", result);
  } catch (error) {
    next(error);
  }
};
