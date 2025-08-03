import { generateContentFromImageAndText } from "../services/googleGeminiLLM.js";

export const imageProcessController = async (req, res) => {
  try {
    if (!req.file || !req.body.prompt) {
      return res
        .status(400)
        .json({ error: "Both image and prompt are required" });
    }

    const result = await generateContentFromImageAndText(
      req.file.path,
      req.body.prompt
    );

    res.json({ response: result });
  } catch (error) {
    console.error("Image processing error:", error);
    res.status(500).json({ error: "Failed to process the image request" });
  }
};
