import Report from "../models/Report.model.js";
import User from "../models/User.model.js";
import { AppError } from "../utils/apiResponse.utils.js";

/**
 * Submit a report against a user
 * @param {Object} reportData - { reportedUserId, barterId, reportedSkillId, reason, description }
 * @param {String} reporterId - User submitting the report
 */
export const createReport = async (reportData, reporterId) => {
  const { reportedUserId, barterId, reportedSkillId, reason, description } =
    reportData;

  // Cannot report yourself
  if (reportedUserId.toString() === reporterId.toString()) {
    throw new AppError("You cannot report yourself", 400);
  }

  // Check reported user exists
  const reportedUser = await User.findById(reportedUserId);
  if (!reportedUser) {
    throw new AppError("Reported user not found", 404);
  }

  // Prevent duplicate reports for the same barter
  if (barterId) {
    const existing = await Report.findOne({
      reporter: reporterId,
      reportedUser: reportedUserId,
      barter: barterId,
    });
    if (existing) {
      throw new AppError(
        "You have already submitted a report for this barter",
        400,
      );
    }
  }

  const report = await Report.create({
    reporter: reporterId,
    reportedUser: reportedUserId,
    barter: barterId || null,
    reportedSkill: reportedSkillId || null,
    reason,
    description,
  });

  return { report };
};
