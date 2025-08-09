import {
  saveUserApiKey,
  getUserApiKey,
  deleteUserApiKey,
  userHasApiKey,
} from "../services/userApiKeyService.js";

/**
 * Save or update a user's API key
 */
export const saveApiKeyController = async (req, res) => {
  try {
    const { userId, apiKey } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!apiKey) {
      return res.status(400).json({ error: "API key is required" });
    }

    // Validate API key format (basic validation)
    if (!apiKey.startsWith("AIza") || apiKey.length < 30) {
      return res.status(400).json({ 
        error: "Invalid Google API key format. Please check your API key." 
      });
    }

    await saveUserApiKey(userId, apiKey);

    res.json({ 
      success: true, 
      message: "API key saved successfully" 
    });
  } catch (error) {
    console.error("Save API key error:", error);
    res.status(500).json({ 
      error: "Failed to save API key. Please try again." 
    });
  }
};

/**
 * Check if user has an API key stored
 */
export const checkApiKeyController = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const hasApiKey = await userHasApiKey(userId);

    res.json({ 
      hasApiKey,
      message: hasApiKey ? "User has API key stored" : "User has no API key stored"
    });
  } catch (error) {
    console.error("Check API key error:", error);
    res.status(500).json({ 
      error: "Failed to check API key status" 
    });
  }
};

/**
 * Delete a user's API key
 */
export const deleteApiKeyController = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    await deleteUserApiKey(userId);

    res.json({ 
      success: true, 
      message: "API key deleted successfully. Will now use shared API key." 
    });
  } catch (error) {
    console.error("Delete API key error:", error);
    res.status(500).json({ 
      error: "Failed to delete API key. Please try again." 
    });
  }
};

/**
 * Get masked version of user's API key (for display purposes)
 */
export const getApiKeyStatusController = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const apiKey = await getUserApiKey(userId);
    
    if (!apiKey) {
      return res.json({ 
        hasApiKey: false,
        maskedKey: null,
        usingSharedKey: true,
        message: "Using shared API key"
      });
    }

    // Return masked version for security
    const maskedKey = apiKey.substring(0, 6) + "..." + apiKey.substring(apiKey.length - 4);

    res.json({ 
      hasApiKey: true,
      maskedKey,
      usingSharedKey: false,
      message: "Using personal API key"
    });
  } catch (error) {
    console.error("Get API key status error:", error);
    res.status(500).json({ 
      error: "Failed to get API key status" 
    });
  }
};