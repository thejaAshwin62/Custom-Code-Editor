import express from "express";
import {
  getUserStatsController,
  getRecentActivityController,
  getUsageByDateRangeController,
  logUsageController,
  getDashboardSummaryController,
} from "../controllers/geminiUsageController.js";

const router = express.Router();

// Get comprehensive usage statistics for a user
// GET /api/gemini-usage/stats/:userId?days=30
router.get("/stats/:userId", getUserStatsController);

// Get recent usage activity for a user
// GET /api/gemini-usage/activity/:userId?limit=50
router.get("/activity/:userId", getRecentActivityController);

// Get usage statistics for a specific date range
// GET /api/gemini-usage/range/:userId?startDate=2025-01-01&endDate=2025-01-31
router.get("/range/:userId", getUsageByDateRangeController);

// Get dashboard summary (last 7 days, 30 days, and recent activity)
// GET /api/gemini-usage/dashboard/:userId
router.get("/dashboard/:userId", getDashboardSummaryController);

// Manually log a usage event (for testing or manual tracking)
// POST /api/gemini-usage/log/:userId
router.post("/log/:userId", logUsageController);

export default router;
