import { supabase, TABLES } from "./supabaseService.js";

/**
 * Log Gemini API usage for a user
 * @param {string} userId - User identifier
 * @param {string} endpoint - API endpoint used ('explain', 'autocomplete', 'inline-completion', 'chat-modification')
 * @param {string} status - Request status ('success', 'error', 'failed')
 * @param {object} options - Additional options
 * @param {number} options.requestTokens - Number of input tokens
 * @param {number} options.responseTokens - Number of output tokens
 * @param {number} options.executionTime - Execution time in milliseconds
 * @param {string} options.errorMessage - Error message if status is 'error' or 'failed'
 */
export async function logGeminiUsage(userId, endpoint, status, options = {}) {
  try {
    const {
      requestTokens = 0,
      responseTokens = 0,
      executionTime = 0,
      errorMessage = null,
    } = options;

    // Calculate total tokens and current date
    const totalTokens = requestTokens + responseTokens;
    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    const { data, error } = await supabase
      .from(TABLES.GEMINI_USAGE)
      .insert({
        user_id: userId,
        endpoint,
        status,
        request_tokens: requestTokens,
        response_tokens: responseTokens,
        total_tokens: totalTokens,
        execution_time: executionTime,
        error_message: errorMessage,
        date: currentDate,
      })
      .select()
      .single();

    if (error) {
      console.error("Error logging Gemini usage:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error in logGeminiUsage:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's Gemini usage statistics
 * @param {string} userId - User identifier
 * @param {number} daysBack - Number of days to look back (default: 30)
 */
export async function getUserUsageStats(userId, daysBack = 30) {
  try {
    // Get overall stats
    const { data: overallStats, error: overallError } = await supabase
      .from(TABLES.GEMINI_USAGE)
      .select("status, total_tokens, execution_time, created_at")
      .eq("user_id", userId)
      .gte(
        "created_at",
        new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString()
      );

    if (overallError) {
      throw overallError;
    }

    // Calculate summary statistics
    const totalRequests = overallStats.length;
    const successfulRequests = overallStats.filter(
      (stat) => stat.status === "success"
    ).length;
    const failedRequests = totalRequests - successfulRequests;
    const totalTokens = overallStats.reduce(
      (sum, stat) => sum + (stat.total_tokens || 0),
      0
    );
    const avgExecutionTime =
      totalRequests > 0
        ? Math.round(
            overallStats.reduce(
              (sum, stat) => sum + (stat.execution_time || 0),
              0
            ) / totalRequests
          )
        : 0;
    const successRate =
      totalRequests > 0
        ? Math.round((successfulRequests / totalRequests) * 100)
        : 0;

    // Get daily usage using the stored procedure
    const { data: dailyUsage, error: dailyError } = await supabase.rpc(
      "get_daily_usage_stats",
      {
        user_uuid: userId,
        days_back: daysBack,
      }
    );

    if (dailyError) {
      console.error("Error fetching daily usage stats:", dailyError);
    }

    // Get endpoint usage using the stored procedure
    const { data: endpointUsage, error: endpointError } = await supabase.rpc(
      "get_endpoint_usage_stats",
      {
        user_uuid: userId,
        days_back: daysBack,
      }
    );

    if (endpointError) {
      console.error("Error fetching endpoint usage stats:", endpointError);
    }

    return {
      success: true,
      data: {
        summary: {
          totalRequests,
          successfulRequests,
          failedRequests,
          successRate,
          totalTokens,
          avgExecutionTime,
          periodDays: daysBack,
        },
        dailyUsage: dailyUsage || [],
        endpointUsage: endpointUsage || [],
      },
    };
  } catch (error) {
    console.error("Error in getUserUsageStats:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get recent usage activity for a user
 * @param {string} userId - User identifier
 * @param {number} limit - Number of recent activities to fetch (default: 50)
 */
export async function getRecentUsageActivity(userId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from(TABLES.GEMINI_USAGE)
      .select(
        "endpoint, status, total_tokens, execution_time, error_message, created_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error in getRecentUsageActivity:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get usage statistics for a specific date range
 * @param {string} userId - User identifier
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 */
export async function getUsageByDateRange(userId, startDate, endDate) {
  try {
    const { data, error } = await supabase
      .from(TABLES.GEMINI_USAGE)
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", `${startDate}T00:00:00.000Z`)
      .lte("created_at", `${endDate}T23:59:59.999Z`)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Calculate statistics for the date range
    const totalRequests = data.length;
    const successfulRequests = data.filter(
      (item) => item.status === "success"
    ).length;
    const failedRequests = totalRequests - successfulRequests;
    const totalTokens = data.reduce(
      (sum, item) => sum + (item.total_tokens || 0),
      0
    );
    const avgExecutionTime =
      totalRequests > 0
        ? Math.round(
            data.reduce((sum, item) => sum + (item.execution_time || 0), 0) /
              totalRequests
          )
        : 0;

    return {
      success: true,
      data: {
        summary: {
          totalRequests,
          successfulRequests,
          failedRequests,
          totalTokens,
          avgExecutionTime,
          startDate,
          endDate,
        },
        activities: data,
      },
    };
  } catch (error) {
    console.error("Error in getUsageByDateRange:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete old usage records (for data cleanup)
 * @param {number} daysToKeep - Number of days of data to keep (default: 90)
 */
export async function cleanupOldUsageData(daysToKeep = 90) {
  try {
    const cutoffDate = new Date(
      Date.now() - daysToKeep * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data, error } = await supabase
      .from(TABLES.GEMINI_USAGE)
      .delete()
      .lt("created_at", cutoffDate);

    if (error) {
      throw error;
    }

    return { success: true, deletedCount: data?.length || 0 };
  } catch (error) {
    console.error("Error in cleanupOldUsageData:", error);
    return { success: false, error: error.message };
  }
}
