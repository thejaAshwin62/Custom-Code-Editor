import { getApiKeyForUser, saveUserApiKey, getUserApiKey, userHasApiKey, deleteUserApiKey } from "./services/userApiKeyService.js";
import dotenv from "dotenv";

dotenv.config();

// Test user API key management functionality
async function testApiKeyManagement() {
  const testUserId = "test_user_123";
  const testApiKey = "AIzaSyTestKeyForTesting123456789012345";

  console.log("🧪 Testing User API Key Management System\n");

  try {
    // Test 1: Check if user has API key (should be false initially)
    console.log("1. Checking if user has API key initially...");
    const hasKeyInitially = await userHasApiKey(testUserId);
    console.log(`   Result: ${hasKeyInitially ? "❌ ERROR: User should not have API key initially" : "✅ PASS: User has no API key initially"}\n`);

    // Test 2: Get API key for user (should return shared key)
    console.log("2. Getting API key for user (should return shared key)...");
    const initialApiKey = await getApiKeyForUser(testUserId);
    const sharedKey = process.env.GOOGLE_API_KEY;
    console.log(`   Shared key available: ${sharedKey ? "✅ YES" : "❌ NO"}`);
    console.log(`   Result: ${initialApiKey === sharedKey ? "✅ PASS: Using shared key" : "❌ ERROR: Not using shared key"}\n`);

    // Test 3: Save user's personal API key
    console.log("3. Saving user's personal API key...");
    await saveUserApiKey(testUserId, testApiKey);
    console.log("   ✅ PASS: API key saved successfully\n");

    // Test 4: Check if user has API key (should be true now)
    console.log("4. Checking if user has API key after saving...");
    const hasKeyAfterSave = await userHasApiKey(testUserId);
    console.log(`   Result: ${hasKeyAfterSave ? "✅ PASS: User has API key" : "❌ ERROR: User should have API key"}\n`);

    // Test 5: Get user's personal API key
    console.log("5. Retrieving user's personal API key...");
    const retrievedKey = await getUserApiKey(testUserId);
    console.log(`   Retrieved key matches: ${retrievedKey === testApiKey ? "✅ PASS" : "❌ ERROR"}`);
    console.log(`   Expected: ${testApiKey}`);
    console.log(`   Got: ${retrievedKey}\n`);

    // Test 6: Get API key for user (should return personal key now)
    console.log("6. Getting API key for user (should return personal key)...");
    const personalApiKey = await getApiKeyForUser(testUserId);
    console.log(`   Result: ${personalApiKey === testApiKey ? "✅ PASS: Using personal key" : "❌ ERROR: Not using personal key"}\n`);

    // Test 7: Update user's API key
    console.log("7. Updating user's API key...");
    const updatedTestKey = "AIzaSyUpdatedTestKey123456789012345";
    await saveUserApiKey(testUserId, updatedTestKey);
    const updatedRetrievedKey = await getUserApiKey(testUserId);
    console.log(`   Result: ${updatedRetrievedKey === updatedTestKey ? "✅ PASS: API key updated" : "❌ ERROR: API key not updated"}\n`);

    // Test 8: Delete user's API key
    console.log("8. Deleting user's API key...");
    await deleteUserApiKey(testUserId);
    const hasKeyAfterDelete = await userHasApiKey(testUserId);
    console.log(`   Result: ${!hasKeyAfterDelete ? "✅ PASS: API key deleted" : "❌ ERROR: API key still exists"}\n`);

    // Test 9: Get API key for user after deletion (should return shared key again)
    console.log("9. Getting API key after deletion (should return shared key)...");
    const keyAfterDeletion = await getApiKeyForUser(testUserId);
    console.log(`   Result: ${keyAfterDeletion === sharedKey ? "✅ PASS: Back to using shared key" : "❌ ERROR: Not using shared key"}\n`);

    console.log("🎉 All tests completed!\n");

  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Note: Make sure you have:");
  console.log("- GOOGLE_API_KEY set in your .env file");
  console.log("- API_KEY_ENCRYPTION_KEY set in your .env file");
  console.log("- Supabase configuration properly set up");
  console.log("- The user_api_keys table created in your database\n");
  
  testApiKeyManagement().then(() => {
    console.log("Test execution completed.");
    process.exit(0);
  }).catch((error) => {
    console.error("Test execution failed:", error);
    process.exit(1);
  });
}

export { testApiKeyManagement };