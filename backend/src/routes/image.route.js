// backend/routes/image.route.js
import express from "express";
import Bytez from "bytez.js";

const router = express.Router();

const bytezKey = process.env.BYTEZ_API_KEY;
if (!bytezKey) {
  console.warn("BYTEZ_API_KEY is not set in .env");
}

const sdk = new Bytez(bytezKey);

// IMAGE MODEL – photoreal
const imageModel = sdk.model("dreamlike-art/dreamlike-photoreal-2.0"); // [web:29]

// VIDEO MODEL – ali-vilab text-to-video
const videoModel = sdk.model("ali-vilab/text-to-video-ms-1.7b"); // [web:51]

/**
 * POST /api/image/generate
 * Body: { prompt: string }
 * Returns: { prompt, url }
 */
router.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await imageModel.run(prompt.trim());
    const { error, output, output_png } = result || {};

    if (error) {
      console.error("Bytez image model error:", error);
      return res.status(500).json({ error: "Image generation failed" });
    }

    // If model returns raw PNG bytes (base64), turn into data URL[web:51]
    let url = output;
    if (!url && output_png) {
      url = `data:image/png;base64,${output_png}`;
    }

    if (!url) {
      return res
        .status(500)
        .json({ error: "Model did not return an image URL" });
    }

    return res.json({
      prompt: prompt.trim(),
      url,
    });
  } catch (err) {
    console.error("Image generate route error:", err);
    return res
      .status(500)
      .json({ error: "Server error while generating image" });
  }
});

/**
 * POST /api/image/video/generate
 * Body: { prompt: string }
 * Returns: { prompt, url }
 * Note: ali-vilab/text-to-video-ms-1.7b typically generates short clips per call,
 * but is capable of up to ~25 seconds with proper settings. [web:37][web:40]
 */
router.post("/video/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await videoModel.run(prompt.trim());
    const { error, output } = result || {};

    if (error) {
      console.error("Bytez video model error:", error);
      return res.status(500).json({ error: "Video generation failed" });
    }

    if (!output) {
      return res
        .status(500)
        .json({ error: "Model did not return a video URL" });
    }

    // output is a video URL on Bytez CDN[web:51]
    return res.json({
      prompt: prompt.trim(),
      url: output,
    });
  } catch (err) {
    console.error("Video generate route error:", err);
    return res
      .status(500)
      .json({ error: "Server error while generating video" });
  }
});

export default router;
