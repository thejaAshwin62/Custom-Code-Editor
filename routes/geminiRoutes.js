import express from "express";
import {
  explainCodeController,
  autoCompleteController,
  inlineCompletionController,
  chatCodeModificationController,
} from "../controllers/geminiController.js";

const router = express.Router();

// Gemini AI-powered endpoints
router.post("/explain", explainCodeController);
router.post("/autocomplete", autoCompleteController);
router.post("/inline-completion", inlineCompletionController);
router.post("/chat-code-modification", chatCodeModificationController);

export default router;
