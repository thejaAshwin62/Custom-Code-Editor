import { Router } from "express";
import multer from "multer";
import { imageProcessController } from "../controllers/imageController.js";
import path from "path";

const router = Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Endpoint to process image and text with Gemini
router.post("/process-image", upload.single("image"), imageProcessController);

export default router;
