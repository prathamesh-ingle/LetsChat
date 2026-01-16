// backend/src/server.js - COMPLETE FIXED VERSION
import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';  // 👈 ESM __dirname FIX

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import aiRoutes from "./routes/ai.route.js";
import { connectDB } from "./lib/db.js";
import imageRoutes from "./routes/image.route.js";

const app = express();
const PORT = process.env.PORT || 5001;

// 👈 ESM __dirname - FIXED
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Basic env logs
console.log("ENV PORT:", PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("CLIENT_URL:", process.env.CLIENT_URL);
console.log("GEMINI_KEY present:", !!process.env.GEMINI_API_KEY);

// 👈 DYNAMIC CORS - FIXED
const corsOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.CLIENT_URL] : ['http://localhost:5173'];

console.log('CORS origins:', corsOrigins);

app.use(cors({ 
  origin: corsOrigins, 
  credentials: true 
}));

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
    corsOrigins,
    gemini: !!process.env.GEMINI_API_KEY,
    port: PORT,
    NODE_ENV: process.env.NODE_ENV,
    endpoints: {
      chat: "/api/chat",
      ai: "/api/ai/chat ✅",
      auth: "/api/auth",
    },
  });
});

if(process.env.NODE_ENV === "production"){
  const distPath = path.join(process.cwd(), '../frontend/dist');  // Root-relative
  console.log('Serving static:', distPath);
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}


app.listen(PORT, () => {  // 👈 Bind all interfaces for Render
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? "✅ Ready" : "❌ Missing"}`);
  connectDB();
});
