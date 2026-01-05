// src/index.js or src/server.js
import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import aiRoutes from "./routes/ai.route.js";
import { connectDB } from "./lib/db.js";
import imageRoutes from "./routes/image.route.js";


const app = express();
const PORT = process.env.PORT || 5001;

const __dirname = path.resolve();

// Basic env sanity logs
console.log("ENV PORT:", PORT);
console.log("GEMINI_KEY present:", !!process.env.GEMINI_API_KEY);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/image", imageRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    gemini: !!process.env.GEMINI_API_KEY,
    port: PORT,
    endpoints: {
      chat: "/api/chat",
      ai: "/api/ai/chat ✅",
      auth: "/api/auth",
    },
  });
});

if(process.env.NODE_ENV ==="production"){
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend","dist","index.html"));
  })
}

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(
    `🤖 Gemini AI: ${
      process.env.GEMINI_API_KEY ? "✅ Ready" : "❌ Missing Key"
    }`
  );
  connectDB();
});
