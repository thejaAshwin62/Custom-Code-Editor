import { supabase, TABLES } from "./supabaseService.js";
import crypto from "crypto";

// Encryption config
// Use a secret from env, derive a 32-byte key via SHA-256 to satisfy aes-256 requirements
const ENCRYPTION_SECRET =
  process.env.API_KEY_ENCRYPTION_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "dev-fallback-secret-only-for-local";
const KEY = crypto.createHash("sha256").update(ENCRYPTION_SECRET).digest(); // 32 bytes
const ALGORITHM = "aes-256-cbc"; // keep CBC to avoid schema changes (no auth tag column)
const IV_LENGTH = 16; // bytes

/**
 * Encrypt an API key for secure storage (hex output)
 */
function encryptApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== "string") {
    throw new Error("Invalid API key");
  }
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(apiKey, "utf8"),
    cipher.final(),
  ]);
  return {
    encrypted: encrypted.toString("hex"),
    iv: iv.toString("hex"),
  };
}

/**
 * Decrypt an API key (expects hex-encoded ciphertext and IV)
 */
function decryptApiKey(encryptedData, ivHex) {
  if (!encryptedData || !ivHex) return null;
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

/**
 * Save or update a user's API key
 */
export async function saveUserApiKey(userId, apiKey) {
  try {
    // Encrypt the API key
    const { encrypted, iv } = encryptApiKey(apiKey);

    // Check if user already has an API key
    const { data: existingKey } = await supabase
      .from(TABLES.USER_API_KEYS)
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingKey) {
      // Update existing key
      const { error } = await supabase
        .from(TABLES.USER_API_KEYS)
        .update({
          encrypted_api_key: encrypted,
          iv: iv,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;
    } else {
      // Insert new key
      const { error } = await supabase.from(TABLES.USER_API_KEYS).insert({
        user_id: userId,
        encrypted_api_key: encrypted,
        iv: iv,
      });

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving user API key:", error);
    throw new Error("Failed to save API key");
  }
}

/**
 * Retrieve and decrypt a user's API key
 */
export async function getUserApiKey(userId) {
  try {
    const { data, error } = await supabase
      .from(TABLES.USER_API_KEYS)
      .select("encrypted_api_key, iv")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return null; // User doesn't have a stored API key
    }

    // Decrypt the API key
    const decryptedKey = decryptApiKey(data.encrypted_api_key, data.iv);
    return decryptedKey;
  } catch (error) {
    console.error("Error retrieving user API key:", error);
    return null;
  }
}

/**
 * Delete a user's API key
 */
export async function deleteUserApiKey(userId) {
  try {
    const { error } = await supabase
      .from(TABLES.USER_API_KEYS)
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting user API key:", error);
    throw new Error("Failed to delete API key");
  }
}

/**
 * Check if a user has a stored API key
 */
export async function userHasApiKey(userId) {
  try {
    const { data, error } = await supabase
      .from(TABLES.USER_API_KEYS)
      .select("id")
      .eq("user_id", userId)
      .single();

    return !error && data !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Get the API key to use for a user (their own key or fallback to shared key)
 */
export async function getApiKeyForUser(userId) {
  if (!userId) {
    // No user ID provided, use shared key
    return process.env.GOOGLE_API_KEY;
  }

  // Try to get user's personal API key
  const userApiKey = await getUserApiKey(userId);

  if (userApiKey) {
    return userApiKey;
  }

  // Fallback to shared key
  return process.env.GOOGLE_API_KEY;
}
