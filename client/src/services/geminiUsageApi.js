import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Get comprehensive usage statistics for a user
 * @param {string} userId - User identifier
 * @param {number} days - Number of days to look back (default: 30)
 */
export const getUserUsageStats = async (userId, days = 30) => {
  try {
    const response = await api.get(`/api/gemini-usage/stats/${userId}`, {
      params: { days },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user usage stats:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get recent usage activity for a user
 * @param {string} userId - User identifier
 * @param {number} limit - Number of recent activities to fetch (default: 50)
 */
export const getRecentUsageActivity = async (userId, limit = 50) => {
  try {
    const response = await api.get(`/api/gemini-usage/activity/${userId}`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get usage statistics for a specific date range
 * @param {string} userId - User identifier
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 */
export const getUsageByDateRange = async (userId, startDate, endDate) => {
  try {
    const response = await api.get(`/api/gemini-usage/range/${userId}`, {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching usage by date range:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get dashboard summary (last 7 days, 30 days, and recent activity)
 * @param {string} userId - User identifier
 */
export const getDashboardSummary = async (userId) => {
  try {
    const response = await api.get(`/api/gemini-usage/dashboard/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Enhanced Gemini API calls with usage tracking
 */

/**
 * Explain code with usage tracking
 * @param {string} code - Code to explain
 * @param {string} userId - User identifier
 */
export const explainCodeWithTracking = async (code, userId) => {
  try {
    const response = await api.post("/explain", {
      code,
      userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error explaining code:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get code suggestions with usage tracking
 * @param {string} code - Code context
 * @param {string} userId - User identifier
 */
export const getCodeSuggestionsWithTracking = async (code, userId) => {
  try {
    const response = await api.post("/autocomplete", {
      code,
      userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error getting code suggestions:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get inline completion with usage tracking
 * @param {string} code - Code context
 * @param {number} position - Cursor position
 * @param {string} language - Programming language
 * @param {string} userId - User identifier
 */
export const getInlineCompletionWithTracking = async (
  code,
  position,
  language,
  userId
) => {
  try {
    const response = await api.post("/inline-completion", {
      code,
      position,
      language,
      userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error getting inline completion:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Modify code with chat with usage tracking
 * @param {string} message - User message
 * @param {string} currentCode - Current code
 * @param {string} language - Programming language
 * @param {string} userId - User identifier
 */
export const modifyCodeWithTracking = async (
  message,
  currentCode,
  language,
  userId
) => {
  try {
    const response = await api.post("/chat-code-modification", {
      message,
      currentCode,
      language,
      userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error modifying code:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Utility functions for formatting and displaying usage data
 */

/**
 * Format usage data for charts
 * @param {Array} dailyUsage - Daily usage data from API
 */
export const formatUsageDataForChart = (dailyUsage) => {
  return dailyUsage
    .map((day) => ({
      date: new Date(day.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      requests: parseInt(day.total_requests),
      successful: parseInt(day.successful_requests),
      failed: parseInt(day.failed_requests),
      tokens: parseInt(day.total_tokens),
      avgTime: parseFloat(day.avg_execution_time),
    }))
    .reverse(); // Reverse to show chronological order
};

/**
 * Calculate usage trends
 * @param {Array} dailyUsage - Daily usage data
 */
export const calculateUsageTrends = (dailyUsage) => {
  if (dailyUsage.length < 2) return null;

  const recent = dailyUsage.slice(-7); // Last 7 days
  const previous = dailyUsage.slice(-14, -7); // Previous 7 days

  const recentAvg =
    recent.reduce((sum, day) => sum + parseInt(day.total_requests), 0) /
    recent.length;
  const previousAvg =
    previous.length > 0
      ? previous.reduce((sum, day) => sum + parseInt(day.total_requests), 0) /
        previous.length
      : 0;

  const trend =
    previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

  return {
    current: Math.round(recentAvg),
    previous: Math.round(previousAvg),
    trend: Math.round(trend * 100) / 100,
    direction: trend > 0 ? "up" : trend < 0 ? "down" : "stable",
  };
};

/**
 * Get usage insights and recommendations
 * @param {Object} usageStats - Usage statistics
 */
export const getUsageInsights = (usageStats) => {
  // Handle both direct summary object and nested data structure
  const summary = usageStats?.summary || usageStats;
  const endpointUsage = usageStats?.endpointUsage || [];
  const insights = [];

  // Check if we have valid summary data
  if (!summary || typeof summary.successRate === "undefined") {
    return insights;
  }

  // Success rate insights
  if (summary.successRate < 85) {
    insights.push({
      type: "warning",
      title: "Low Success Rate",
      message: `Your API success rate is ${summary.successRate}%. Consider reviewing error patterns.`,
    });
  }

  // High usage insights
  if (summary.totalRequests && summary.totalRequests > 1000) {
    insights.push({
      type: "info",
      title: "High Usage",
      message:
        "You're a power user! Consider optimizing requests for better performance.",
    });
  }

  // Endpoint-specific insights
  if (endpointUsage && endpointUsage.length > 0) {
    const mostUsed = endpointUsage[0];
    if (mostUsed && mostUsed.endpoint && mostUsed.total_requests) {
      insights.push({
        type: "info",
        title: "Most Used Feature",
        message: `Your most used feature is ${mostUsed.endpoint} with ${mostUsed.total_requests} requests.`,
      });
    }
  }

  return insights;
};
