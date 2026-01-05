// src/routes/emergency.route.js
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// ---- GEMINI SETUP ----
if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is missing in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// IMPORTANT: full model id for v1beta
const EMERGENCY_MODEL_NAME = "models/gemini-1.5-flash";

// ---- PATH / JSON LOAD ----
// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ../../data/maharashtra_emergency.json
const emergencyJsonPath = path.join(
  __dirname,
  "..",         // -> backend/src
  "data",       // -> backend/src/data
  "maharashtra_emergency.json"
);

let emergencyData = {};
try {
  if (fs.existsSync(emergencyJsonPath)) {
    const raw = fs.readFileSync(emergencyJsonPath, "utf-8");
    emergencyData = JSON.parse(raw);
    console.log("Loaded Maharashtra emergency data from:", emergencyJsonPath);
  } else {
    console.error("maharashtra_emergency.json not found at", emergencyJsonPath);
  }
} catch (e) {
  console.error("Failed to load maharashtra_emergency.json", e);
  emergencyData = {};
}

/**
 * POST /api/emergency/classify
 * body: { message: string, city?: string }
 * result: { intent, level, reason, city, suggestedNumber }
 */
router.post("/classify", async (req, res) => {
  try {
    const { message, city = "" } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    const cityKey = city.trim().toLowerCase();
    const cityConfig =
      emergencyData[cityKey] || emergencyData["default"] || {};

    const prompt = `
You are a safety assistant for a chat app in Maharashtra, India.
Classify the user's message into an emergency intent and level.

Allowed "intent" values:
- "ambulance"
- "police"
- "fire"
- "none"

Allowed "level" values:
- "urgent"
- "maybe_urgent"
- "normal"

Rules:
- "ambulance": health emergencies, accident, severe injury, heart attack, unconscious, heavy bleeding, suicide attempt, etc.
- "police": crime, theft, assault, domestic violence, threats, harassment, kidnapping, etc.
- "fire": fire, explosion, gas leak, building burning, large smoke, etc.
- If multiple emergencies, pick the MOST IMPORTANT one.
- If no clear emergency, intent = "none" and level = "normal".

Return STRICT JSON only:
{
  "intent": "ambulance" | "police" | "fire" | "none",
  "level": "urgent" | "maybe_urgent" | "normal",
  "reason": "short explanation in English"
}

User message:
"""${message}"""
`.trim();

    const model = genAI.getGenerativeModel({ model: EMERGENCY_MODEL_NAME });

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("Could not parse emergency JSON from Gemini:", text);
      parsed = {
        intent: "none",
        level: "normal",
        reason: "Could not parse AI response as JSON."
      };
    }

    const intent = parsed.intent || "none";

    // pick suggested number
    let suggestedNumber = null;
    if (intent === "ambulance") {
      suggestedNumber =
        (cityConfig.ambulance && cityConfig.ambulance[0]) || null;
    } else if (intent === "police") {
      suggestedNumber = (cityConfig.police && cityConfig.police[0]) || null;
    } else if (intent === "fire") {
      suggestedNumber = (cityConfig.fire && cityConfig.fire[0]) || null;
    }

    return res.json({
      intent,
      level: parsed.level || "normal",
      reason: parsed.reason || "",
      city: cityKey || "default",
      suggestedNumber
    });
  } catch (error) {
    console.error("Emergency classify error stack:", error);
    return res.status(500).json({
      error: "Emergency classifier temporarily unavailable",
      details:
        process.env.NODE_ENV === "development"
          ? String(error.message || error)
          : undefined
    });
  }
});

export default router;
