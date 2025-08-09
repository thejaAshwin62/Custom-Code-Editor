/**
 * Simple test script to verify Gemini usage tracking is working
 * Run this to test if the usage logging is properly functioning
 */

import {
  logGeminiUsage,
  getUserUsageStats,
} from "../services/geminiUsageService.js";

async function testUsageTracking() {
  console.log("🧪 Testing Gemini Usage Tracking System");
  console.log("=====================================\n");

  // Test user ID (using one from your database)
  const testUserId = "user_30sTLw3JrUMGovBHUa71Mwq632Z";

  console.log(`📊 Testing with User ID: ${testUserId}\n`);

  try {
    // Test 1: Log a successful explain request
    console.log("1️⃣ Testing successful explain request...");
    const explainResult = await logGeminiUsage(
      testUserId,
      "explain",
      "success",
      {
        requestTokens: 150,
        responseTokens: 300,
        executionTime: 1200,
      }
    );

    if (explainResult.success) {
      console.log("✅ Explain request logged successfully");
      console.log(`   - Request ID: ${explainResult.data.id}`);
    } else {
      console.log("❌ Failed to log explain request:", explainResult.error);
    }

    // Test 2: Log a failed autocomplete request
    console.log("\n2️⃣ Testing failed autocomplete request...");
    const autocompleteResult = await logGeminiUsage(
      testUserId,
      "autocomplete",
      "error",
      {
        requestTokens: 80,
        responseTokens: 0,
        executionTime: 800,
        errorMessage: "API rate limit exceeded",
      }
    );

    if (autocompleteResult.success) {
      console.log("✅ Failed autocomplete logged successfully");
      console.log(`   - Request ID: ${autocompleteResult.data.id}`);
    } else {
      console.log(
        "❌ Failed to log autocomplete request:",
        autocompleteResult.error
      );
    }

    // Test 3: Log an inline completion
    console.log("\n3️⃣ Testing inline completion request...");
    const inlineResult = await logGeminiUsage(
      testUserId,
      "inline-completion",
      "success",
      {
        requestTokens: 45,
        responseTokens: 25,
        executionTime: 450,
      }
    );

    if (inlineResult.success) {
      console.log("✅ Inline completion logged successfully");
      console.log(`   - Request ID: ${inlineResult.data.id}`);
    } else {
      console.log("❌ Failed to log inline completion:", inlineResult.error);
    }

    // Test 4: Get usage statistics
    console.log("\n4️⃣ Fetching usage statistics...");
    const statsResult = await getUserUsageStats(testUserId, 7); // Last 7 days

    if (statsResult.success) {
      console.log("✅ Usage statistics retrieved successfully");
      console.log("\n📈 Usage Summary:");
      const summary = statsResult.data.summary;
      console.log(`   - Total Requests: ${summary.totalRequests}`);
      console.log(
        `   - Successful: ${summary.successfulRequests} (${summary.successRate}%)`
      );
      console.log(`   - Failed: ${summary.failedRequests}`);
      console.log(`   - Total Tokens: ${summary.totalTokens}`);
      console.log(`   - Avg Execution Time: ${summary.avgExecutionTime}ms`);

      if (
        statsResult.data.dailyUsage &&
        statsResult.data.dailyUsage.length > 0
      ) {
        console.log("\n📅 Recent Daily Usage:");
        statsResult.data.dailyUsage.slice(0, 3).forEach((day) => {
          console.log(
            `   - ${day.date}: ${day.total_requests} requests, ${day.total_tokens} tokens`
          );
        });
      }

      if (
        statsResult.data.endpointUsage &&
        statsResult.data.endpointUsage.length > 0
      ) {
        console.log("\n🎯 Endpoint Usage:");
        statsResult.data.endpointUsage.forEach((endpoint) => {
          console.log(
            `   - ${endpoint.endpoint}: ${endpoint.total_requests} requests (${endpoint.success_rate}% success)`
          );
        });
      }
    } else {
      console.log("❌ Failed to get usage statistics:", statsResult.error);
    }

    console.log("\n🎉 Usage tracking test completed!");
    console.log("\n💡 How to use in your app:");
    console.log("1. Every Gemini API call now automatically logs usage");
    console.log('2. Check your Supabase database "gemini_usage" table');
    console.log("3. Use the stats API endpoints for user dashboards");
    console.log(
      `4. Example API call: GET /api/gemini-usage/stats/${testUserId}`
    );
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Run the test
testUsageTracking();
