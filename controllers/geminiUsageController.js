import {
  getUserUsageStats,
  getRecentUsageActivity,
  getUsageByDateRange,
  logGeminiUsage,
} from "../services/geminiUsageService.js";

/**
 * Get comprehensive usage statistics for a user
 */
export const getUserStatsController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const daysBack = parseInt(days) || 30;

    if (daysBack < 1 || daysBack > 365) {
      return res.status(400).json({
        success: false,
        error: "Days must be between 1 and 365",
      });
    }

    const result = await getUserUsageStats(userId, daysBack);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || "Failed to fetch usage statistics",
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in getUserStatsController:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching usage statistics",
    });
  }
};

/**
 * Get recent usage activity for a user
 */
export const getRecentActivityController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const activityLimit = parseInt(limit) || 50;

    if (activityLimit < 1 || activityLimit > 200) {
      return res.status(400).json({
        success: false,
        error: "Limit must be between 1 and 200",
      });
    }

    const result = await getRecentUsageActivity(userId, activityLimit);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || "Failed to fetch recent activity",
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in getRecentActivityController:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching recent activity",
    });
  }
};

/**
 * Get usage statistics for a specific date range
 */
export const getUsageByDateRangeController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "Start date and end date are required (format: YYYY-MM-DD)",
      });
    }

    // Validate date format
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    if (startDateObj > endDateObj) {
      return res.status(400).json({
        success: false,
        error: "Start date must be before or equal to end date",
      });
    }

    // Limit date range to 1 year
    const daysDifference = Math.ceil(
      (endDateObj - startDateObj) / (1000 * 60 * 60 * 24)
    );
    if (daysDifference > 365) {
      return res.status(400).json({
        success: false,
        error: "Date range cannot exceed 365 days",
      });
    }

    const result = await getUsageByDateRange(userId, startDate, endDate);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || "Failed to fetch usage data for date range",
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in getUsageByDateRangeController:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching usage data",
    });
  }
};

/**
 * Manually log a usage event (for testing or manual tracking)
 */
export const logUsageController = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      endpoint,
      status,
      requestTokens,
      responseTokens,
      executionTime,
      errorMessage,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    if (!endpoint || !status) {
      return res.status(400).json({
        success: false,
        error: "Endpoint and status are required",
      });
    }

    // Validate endpoint
    const validEndpoints = [
      "explain",
      "autocomplete",
      "inline-completion",
      "chat-modification",
    ];
    if (!validEndpoints.includes(endpoint)) {
      return res.status(400).json({
        success: false,
        error: `Invalid endpoint. Must be one of: ${validEndpoints.join(", ")}`,
      });
    }

    // Validate status
    const validStatuses = ["success", "error", "failed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const result = await logGeminiUsage(userId, endpoint, status, {
      requestTokens: parseInt(requestTokens) || 0,
      responseTokens: parseInt(responseTokens) || 0,
      executionTime: parseInt(executionTime) || 0,
      errorMessage,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || "Failed to log usage",
      });
    }

    res.status(201).json({
      success: true,
      data: result.data,
      message: "Usage logged successfully",
    });
  } catch (error) {
    console.error("Error in logUsageController:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while logging usage",
    });
  }
};

/**
 * Get usage summary for dashboard display
 */
export const getDashboardSummaryController = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    // Get last 7 days for quick dashboard view
    const last7Days = await getUserUsageStats(userId, 7);
    // Get last 30 days for monthly view
    const last30Days = await getUserUsageStats(userId, 30);

    if (!last7Days.success || !last30Days.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to fetch dashboard summary",
      });
    }

    // Get recent activity (last 10 items)
    const recentActivity = await getRecentUsageActivity(userId, 10);

    res.json({
      success: true,
      data: {
        last7Days: last7Days.data,
        last30Days: last30Days.data,
        recentActivity: recentActivity.success ? recentActivity.data : [],
      },
    });
  } catch (error) {
    console.error("Error in getDashboardSummaryController:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching dashboard summary",
    });
  }
};
