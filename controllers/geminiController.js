import {
  explainCode,
  getCodeSuggestion,
  getInlineCompletion,
  generateText,
  modifyCode,
} from "../services/googleGeminiLLM.js";
import { logGeminiUsage } from "../services/geminiUsageService.js";

export const explainCodeController = async (req, res) => {
  const startTime = Date.now();
  let userId = null;

  try {
    const { code, userId: requestUserId } = req.body;
    userId = requestUserId;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const explanation = await explainCode(code, userId);
    const executionTime = Date.now() - startTime;

    // Log successful usage
    if (userId) {
      await logGeminiUsage(userId, "explain", "success", {
        requestTokens: Math.ceil(code.length / 4), // Rough token estimation
        responseTokens: Math.ceil(explanation.length / 4),
        executionTime,
      });
    }

    res.json({ explanation });
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error("Explanation error:", error);

    // Log failed usage
    if (userId) {
      await logGeminiUsage(userId, "explain", "error", {
        executionTime,
        errorMessage: error.message,
      });
    }

    res.status(500).json({ error: error.message });
  }
};

export const autoCompleteController = async (req, res) => {
  const startTime = Date.now();
  let userId = null;

  try {
    const { code, userId: requestUserId } = req.body;
    userId = requestUserId;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const rawSuggestion = await getCodeSuggestion(code, userId);
    // Clean the suggestion to ensure it's only code
    const cleanSuggestion = rawSuggestion
      .trim()
      .replace(/^```[^\n]*\n|```$/g, "");

    const executionTime = Date.now() - startTime;

    // Log successful usage
    if (userId) {
      await logGeminiUsage(userId, "autocomplete", "success", {
        requestTokens: Math.ceil(code.length / 4),
        responseTokens: Math.ceil(cleanSuggestion.length / 4),
        executionTime,
      });
    }

    res.json({ suggestion: cleanSuggestion });
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error("Autocomplete error:", error);

    // Log failed usage
    if (userId) {
      await logGeminiUsage(userId, "autocomplete", "error", {
        executionTime,
        errorMessage: error.message,
      });
    }

    res.status(500).json({ error: error.message });
  }
};

export const inlineCompletionController = async (req, res) => {
  const startTime = Date.now();
  let userId = null;

  try {
    const {
      code,
      position,
      language = "javascript",
      userId: requestUserId,
    } = req.body;
    userId = requestUserId;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    console.log("Inline completion request:", {
      language,
      position,
      codeLength: code.length,
    });

    // Get inline completion from Gemini AI
    const completion = await getInlineCompletion(code, position, language, userId);

    console.log("Inline completion result:", completion);

    const executionTime = Date.now() - startTime;

    // Log successful usage
    if (userId) {
      await logGeminiUsage(userId, "inline-completion", "success", {
        requestTokens: Math.ceil(code.length / 4),
        responseTokens: completion ? Math.ceil(completion.length / 4) : 0,
        executionTime,
      });
    }

    res.json({
      completion: completion,
      insertText: completion,
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error("Inline completion error:", error);

    // Log failed usage
    if (userId) {
      await logGeminiUsage(userId, "inline-completion", "error", {
        executionTime,
        errorMessage: error.message,
      });
    }

    res.status(500).json({ error: error.message });
  }
};

export const chatCodeModificationController = async (req, res) => {
  const startTime = Date.now();
  let userId = null;

  try {
    const {
      message,
      currentCode,
      language = "javascript",
      userId: requestUserId,
    } = req.body;
    userId = requestUserId;

    if (!message || !currentCode) {
      return res
        .status(400)
        .json({ error: "Message and current code are required" });
    }

    // Use the dedicated modifyCode function
    const result = await modifyCode(message, currentCode, language, userId);

    const executionTime = Date.now() - startTime;

    // Check if the code was unchanged
    if (result.unchanged) {
      // Log as successful but with no changes
      if (userId) {
        await logGeminiUsage(userId, "chat-modification", "success", {
          requestTokens: Math.ceil((message + currentCode).length / 4),
          responseTokens: 0,
          executionTime,
        });
      }

      return res.json({
        modifiedCode: currentCode,
        message:
          "No changes were made to the code. Try being more specific in your request.",
        unchanged: true,
      });
    }

    // Log successful usage
    if (userId) {
      await logGeminiUsage(userId, "chat-modification", "success", {
        requestTokens: Math.ceil((message + currentCode).length / 4),
        responseTokens: Math.ceil(
          (result.code + result.explanation).length / 4
        ),
        executionTime,
      });
    }

    // Return the modified code and the explanation
    res.json({
      modifiedCode: result.code,
      explanation: result.explanation,
      message: "Code has been modified as requested.",
      unchanged: false,
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error("Chat code modification error:", error);

    // Log failed usage
    if (userId) {
      await logGeminiUsage(userId, "chat-modification", "error", {
        executionTime,
        errorMessage: error.message,
      });
    }

    res.status(500).json({
      error: error.message,
      message:
        "Failed to modify code. Please try again with a different prompt.",
    });
  }
};
