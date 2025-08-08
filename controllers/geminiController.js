import {
  explainCode,
  getCodeSuggestion,
  getInlineCompletion,
  generateText,
  modifyCode,
} from "../services/googleGeminiLLM.js";

export const explainCodeController = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const explanation = await explainCode(code);
    res.json({ explanation });
  } catch (error) {
    console.error("Explanation error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const autoCompleteController = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const rawSuggestion = await getCodeSuggestion(code);
    // Clean the suggestion to ensure it's only code
    const cleanSuggestion = rawSuggestion
      .trim()
      .replace(/^```[^\n]*\n|```$/g, "");

    res.json({ suggestion: cleanSuggestion });
  } catch (error) {
    console.error("Autocomplete error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const inlineCompletionController = async (req, res) => {
  try {
    const { code, position, language = "javascript" } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    console.log("Inline completion request:", {
      language,
      position,
      codeLength: code.length,
    });

    // Get inline completion from Gemini AI
    const completion = await getInlineCompletion(code, position, language);

    console.log("Inline completion result:", completion);

    res.json({
      completion: completion,
      insertText: completion,
    });
  } catch (error) {
    console.error("Inline completion error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const chatCodeModificationController = async (req, res) => {
  try {
    const { message, currentCode, language = "javascript" } = req.body;

    if (!message || !currentCode) {
      return res
        .status(400)
        .json({ error: "Message and current code are required" });
    }

    // Use the dedicated modifyCode function
    const result = await modifyCode(message, currentCode, language);

    // Check if the code was unchanged
    if (result.unchanged) {
      return res.json({
        modifiedCode: currentCode,
        message:
          "No changes were made to the code. Try being more specific in your request.",
        unchanged: true,
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
    console.error("Chat code modification error:", error);
    res.status(500).json({
      error: error.message,
      message:
        "Failed to modify code. Please try again with a different prompt.",
    });
  }
};
