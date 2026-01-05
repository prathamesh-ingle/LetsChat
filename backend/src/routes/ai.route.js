// backend/src/routes/ai.route.js
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

const router = express.Router();

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is missing in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ---- Reverse geocode: lat/lon -> human location label ----
async function reverseGeocode(lat, lon) {
  if (lat == null || lon == null) return null;

  const url = "https://nominatim.openstreetmap.org/reverse";
  const response = await axios.get(url, {
    params: {
      format: "jsonv2",
      lat,
      lon,
      zoom: 18, // try building / house level
      addressdetails: 1,
    },
    headers: {
      "User-Agent":
        "symptom-checker-ai/1.0 (https://yourdomain.com; prathameshingle72@gmail.com)",
    },
  });

  const data = response.data;
  const addr = data.address || {};

  const parts = [
    addr.house_number,
    addr.road || addr.street,
    addr.suburb || addr.neighbourhood,
    addr.city || addr.town || addr.village || addr.county,
    addr.state,
    addr.postcode,
  ].filter(Boolean);

  const label = parts.join(", ");
  if (label) return label;

  const city =
    addr.suburb ||
    addr.neighbourhood ||
    addr.city ||
    addr.town ||
    addr.village ||
    addr.county ||
    "";
  const state = addr.state || "";
  const fallback = [city, state].filter(Boolean).join(", ");

  return fallback || data.display_name || null;
}

// ---- Overpass: hospitals/clinics around user ----
async function fetchHospitalsFromOverpass(lat, lon, radiusMeters = 3000) {
  if (lat == null || lon == null) {
    console.warn("Overpass: missing lat/lon, cannot query hospitals");
    return [];
  }

  const query = `
    [out:json][timeout:25];
    (
      node["amenity"~"hospital|clinic|doctors|healthcare"](around:${radiusMeters}, ${lat}, ${lon});
      way["amenity"~"hospital|clinic|doctors|healthcare"](around:${radiusMeters}, ${lat}, ${lon});
      relation["amenity"~"hospital|clinic|doctors|healthcare"](around:${radiusMeters}, ${lat}, ${lon});
    );
    out center;
  `;

  const url = "https://overpass-api.de/api/interpreter";

  try {
    const response = await axios.post(url, query, {
      headers: { "Content-Type": "text/plain" },
    });

    const elements = response.data?.elements || [];
    console.log("Overpass elements count:", elements.length);

    return elements
      .map((e) => {
        const name = e.tags?.name;
        const latVal = e.lat || e.center?.lat;
        const lonVal = e.lon || e.center?.lon;
        if (!latVal || !lonVal || !name) return null;

        return {
          id: e.id,
          name,
          lat: latVal,
          lon: lonVal,
          amenity: e.tags?.amenity || "",
          address:
            e.tags?.["addr:full"] ||
            [
              e.tags?.["addr:housenumber"],
              e.tags?.["addr:street"],
              e.tags?.["addr:city"],
            ]
              .filter(Boolean)
              .join(", "),
        };
      })
      .filter(Boolean);
  } catch (err) {
    console.error("Overpass request failed:", err?.message || err);
    return [];
  }
}

router.post("/chat", async (req, res) => {
  try {
    let {
      message,
      history = [],
      userLocation = "Pune, Maharashtra",
      lat,
      lon,
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    // IMPORTANT: force lat/lon into numbers (or null) so Overpass works
    lat = lat !== undefined && lat !== null ? Number(lat) : null;
    lon = lon !== undefined && lon !== null ? Number(lon) : null;

    console.log("AI /chat body:", { userLocation, lat, lon, message });

    // detect location questions
    const lower = message.toLowerCase();
    const isLocationQuestion =
      lower.includes("current location") ||
      lower.includes("where am i") ||
      lower.includes("my location") ||
      lower.includes("where i am right now");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `
You are a medical and location-aware assistant inside a web app.

The app sends you:
- userLocation: a fallback label like "Pune, Maharashtra"
- lat, lon: approximate GPS coordinates
- resolvedLocation: a human-readable label from reverse geocoding.

If the user asks about their current location, you MUST answer using resolvedLocation
(or userLocation if resolvedLocation is missing). Do NOT say you can't see GPS;
assume the app has already provided a safe approximate location.

For symptom queries, give safe, high-level advice and always recommend consulting a doctor.
You NEVER guess precise addresses; only use the resolvedLocation and clinic list the app provides.
      `,
    });

    const chatHistory = (history || [])
      .filter((m) => m && typeof m.content === "string" && m.content.trim())
      .map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: { maxOutputTokens: 1024 },
    });

    // compute resolvedLocation BEFORE sending to model
    let nearbyClinics = [];
    let resolvedLocation = userLocation;

    if (lat != null && lon != null) {
      try {
        console.log("Reverse geocoding for:", lat, lon);
        const rev = await reverseGeocode(lat, lon);
        console.log("Reverse geocode result:", rev);
        if (rev) resolvedLocation = rev;
      } catch (e) {
        console.error("Reverse geocode error:", e?.message || e);
      }
    } else {
      console.warn("No lat/lon provided, using fallback userLocation only");
    }

    // avoid sending "Detecting location…" to model; fall back to generic city/state
    if (
      resolvedLocation &&
      resolvedLocation.toLowerCase().includes("detecting location") &&
      userLocation &&
      !userLocation.toLowerCase().includes("detecting location")
    ) {
      resolvedLocation = userLocation;
    }

    const result = await chat.sendMessage(
      `
USER_MESSAGE: ${message}

CONTEXT:
- userLocation: ${userLocation}
- resolvedLocation: ${resolvedLocation}
- lat: ${lat ?? "null"}
- lon: ${lon ?? "null"}
`
    );

    let aiReply = result.response.text().trim();

    // if it's a location question, prepend a clear line
    if (isLocationQuestion) {
      if (resolvedLocation && !resolvedLocation.toLowerCase().includes("detecting")) {
        aiReply =
          `Your approximate current location is: ${resolvedLocation}.\n\n` +
          aiReply;
      } else {
        aiReply =
          "I do not have a precise location yet because the app did not send valid GPS coordinates.\n\n" +
          aiReply;
      }
    }

    const text = message.toLowerCase();
    const isSymptomQuery =
      text.includes("symptom") ||
      text.includes("pain") ||
      text.includes("fever") ||
      text.includes("cough") ||
      text.includes("headache") ||
      text.includes("sick") ||
      text.includes("stomach") ||
      text.includes("hospital") ||
      text.includes("clinic");

    if (isSymptomQuery) {
      try {
        // first try 3km
        nearbyClinics = await fetchHospitalsFromOverpass(lat, lon, 3000);

        // if nothing, try wider 8km
        if (!nearbyClinics.length && lat != null && lon != null) {
          console.log("No clinics in 3km, retrying with 8000m radius");
          nearbyClinics = await fetchHospitalsFromOverpass(lat, lon, 8000);
        }
      } catch (e) {
        console.error("Overpass error (symptom block):", e?.message || e);
      }

      if (nearbyClinics.length > 0) {
        const clinicsText = nearbyClinics
          .slice(0, 8)
          .map(
            (c) =>
              `• ${c.name}\n  📍 ${
                c.address || `${c.lat.toFixed(4)}, ${c.lon.toFixed(4)}`
              }`
          )
          .join("\n");

        aiReply += `

📍 You appear to be near: ${resolvedLocation}.

🏥 Nearby Hospitals/Clinics (OpenStreetMap data):
${clinicsText}

⚠️ This is preliminary advice only. Consult a doctor for proper diagnosis.`;
      } else {
        aiReply += `

📍 Your approximate area: ${resolvedLocation}.

⚠️ I could not automatically find nearby hospitals/clinics right now (no results or location missing).
Please search manually (Google Maps, local directory) or call local emergency services if needed.`;
      }
    }

    return res.json({
      reply: aiReply,
      role: "model",
      content: aiReply,
      nearbyClinics,
      resolvedLocation,
    });
  } catch (error) {
    console.error("Gemini Error:", error?.response || error);
    return res.status(500).json({
      error: "AI service temporarily unavailable",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;
