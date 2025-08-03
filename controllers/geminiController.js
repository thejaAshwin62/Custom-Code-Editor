import {
  explainCode,
  getCodeSuggestion,
  getInlineCompletion,
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

    // Get inline completion from Gemini AI
    const completion = await getInlineCompletion(code, position, language);

    res.json({
      completion: completion,
      insertText: completion,
    });
  } catch (error) {
    console.error("Inline completion error:", error);
    res.status(500).json({ error: error.message });
  }
};
