import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
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
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(express.json());

// Middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(morgan("dev"));



// API Routes
app.use("/", apiRoutes);
app.use("/api", imageRoutes);
app.use("/api/codes", codeRoutes);
app.use("/api/gemini-usage", geminiUsageRoutes);
app.use("/api/user-api-key", userApiKeyRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Judge0 Compiler Service is running" });
});
// app.use("/agent", agentRoutes);

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
