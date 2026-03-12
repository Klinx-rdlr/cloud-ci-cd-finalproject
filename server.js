require("dotenv").config();
const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// The client is initialized here
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/api/architect-meal", async (req, res) => {
  try {
    const { ingredients } = req.body;

    // Correct Model ID 
    const modelId = "gemini-2.5-flash"; 

    const result = await ai.models.generateContent({
      model: modelId,
      systemInstruction:
        "You are a Michelin-star Chef. Create 3 recipes in valid JSON format based on the ingredients provided.",
      contents: [
        { role: "user", parts: [{ text: `Ingredients: ${ingredients}` }] },
      ],
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
       
        responseSchema: {
          type: "OBJECT", 
          properties: {
            pantry_summary: { type: "STRING" },
            recipes: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING" },
                  difficulty: {
                    type: "STRING",
                    enum: ["Easy", "Intermediate", "Advanced"],
                  },
                  time: { type: "STRING" },
                  missing: { type: "ARRAY", items: { type: "STRING" } },
                  instructions: { type: "ARRAY", items: { type: "STRING" } },
                },
                required: [
                  "name",
                  "difficulty",
                  "time",
                  "instructions",
                  "missing",
                ],
              },
            },
          },
          required: ["pantry_summary", "recipes"],
        },
      },
    });

    if (result.parsed) {
      console.log("✅ Recipe Architecture Complete (Parsed).");
      return res.json(result.parsed);
    }

    // Fallback if parsing fails or result is structured differently
    const text = result.text; 
    if (!text) {
      throw new Error("The Chef didn't return any readable recipes.");
    }

    res.json(JSON.parse(text));
  } catch (error) {
    console.error("--- CHEF ERROR ---", error.message);
    res.status(500).json({
      pantry_summary: "The Chef's kitchen is currently offline.",
      recipes: [],
      error: error.message,
    });
  }
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server spinning at http://localhost:${PORT}`),
);
