import express from "express";
import {
  explainCodeController,
  autoCompleteController,
  inlineCompletionController,
} from "../controllers/geminiController.js";

const router = express.Router();

// Gemini AI-powered endpoints
router.post("/explain", explainCodeController);
router.post("/autocomplete", autoCompleteController);
router.post("/inline-completion", inlineCompletionController);

export default router;
