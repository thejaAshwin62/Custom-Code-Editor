import express from "express";
import {
  saveApiKeyController,
  checkApiKeyController,
  deleteApiKeyController,
  getApiKeyStatusController,
} from "../controllers/userApiKeyController.js";

const router = express.Router();

// API key management endpoints
router.post("/save", saveApiKeyController);
router.get("/check/:userId", checkApiKeyController);
router.get("/status/:userId", getApiKeyStatusController);
router.delete("/delete/:userId", deleteApiKeyController);

export default router;