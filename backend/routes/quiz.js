import express from "express";
import fetch from "node-fetch";
import { getThemeData, getThemesByCategory } from "../data/themePrompts.js";

const router = express.Router();

const MISTRAL_CHAT_URL = "https://api.mistral.ai/v1/chat/completions";

async function generateQuizFromText(topic, numQuestions = 3) {
  if (!process.env.MISTRAL_API_KEY) {
    throw new Error("MISTRAL_API_KEY is not set in environment");
  }

  const prompt = `Tu es une IA qui crée des quiz pédagogiques pour des collégien·nes/lycéen·nes.
Sujet de travail de l'élève : "${topic}".

Génère ${numQuestions} questions à choix multiples pour vérifier qu'il ou elle a bien compris. Utilise un ton bienveillant, simple et clair.

Répond UNIQUEMENT avec du JSON valide, sans explication autour, avec ce format exact :
{
  "questions": [
    {
      "question": "Question en français ?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0
    }
  ]
}`;

  const res = await fetch(MISTRAL_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "open-mistral-7b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1200,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[QuizRoute] Mistral error:", text);
    throw new Error(`Mistral API error: ${res.status}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content || "";
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("No JSON block found in Mistral response");
  }

  const parsed = JSON.parse(match[0]);
  if (!Array.isArray(parsed.questions)) {
    throw new Error("Parsed quiz has no questions array");
  }

  // Normalise shape to { question, options, correct }
  const questions = parsed.questions.map((q) => ({
    question: q.question,
    options: q.options,
    correct: typeof q.correctIndex === "number" ? q.correctIndex : 0,
  }));

  return { questions };
}

router.post("/from-text", async (req, res) => {
  try {
    const { topic, numQuestions } = req.body || {};
    if (!topic || typeof topic !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'topic'" });
    }

    const count = typeof numQuestions === "number" ? numQuestions : 3;
    const quiz = await generateQuizFromText(topic, count);
    res.json({ status: "success", ...quiz });
  } catch (e) {
    console.error("[QuizRoute] Error generating quiz:", e);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

// Get available themes
router.get("/themes", (req, res) => {
  try {
    const themes = getThemesByCategory();
    res.json({ status: "success", themes });
  } catch (e) {
    console.error("[QuizRoute] Error getting themes:", e);
    res.status(500).json({ error: "Failed to get themes" });
  }
});

// Generate quiz from theme
router.post("/from-theme", async (req, res) => {
  try {
    const { themeId, numQuestions } = req.body || {};
    if (!themeId || typeof themeId !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'themeId'" });
    }

    const themeData = getThemeData(themeId);
    if (!themeData) {
      return res.status(404).json({ error: "Theme not found" });
    }

    const count = typeof numQuestions === "number" ? numQuestions : 3;
    const topic = themeData.prompt;
    const quiz = await generateQuizFromText(topic, count);
    res.json({
      status: "success",
      themeId,
      themeData: {
        theme: themeData.theme,
        subTheme: themeData.subTheme,
        difficulty: themeData.difficulty,
        title: themeData.title
      },
      ...quiz
    });
  } catch (e) {
    console.error("[QuizRoute] Error generating themed quiz:", e);
    res.status(500).json({ error: "Failed to generate themed quiz" });
  }
});

export default router;
