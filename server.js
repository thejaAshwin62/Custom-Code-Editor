import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/mongoose/database.js";
import apiRoutes from "./routes/geminiRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import codeRoutes from "./routes/codeRoutes.js";
import geminiUsageRoutes from "./routes/geminiUsageRoutes.js";
import userApiKeyRoutes from "./routes/userApiKeyRoutes.js";
// import agentRoutes from "./routes/agentRoutes.js";

dotenv.config();

// Express App Setup
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

const __dirname = dirname(fileURLToPath(import.meta.url));

// API Routes
app.use("/", apiRoutes);
app.use("/api", imageRoutes);
app.use("/api/codes", codeRoutes);
app.use("/api/gemini-usage", geminiUsageRoutes);
app.use("/api/user-api-key", userApiKeyRoutes);
// app.use("/agent", agentRoutes);

app.use(express.static(path.resolve(__dirname, "./public")));

// Sample Route
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./public", "index.html"));
});

// Start Server and Connect to DB
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  try {
    // await connectDB();
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
});
