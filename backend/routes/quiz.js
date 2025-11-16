import express from "express";
import fetch from "node-fetch";
import { getThemeData, getThemesByCategory } from "../data/themePrompts.js";

const router = express.Router();

const MISTRAL_CHAT_URL = "https://api.mistral.ai/v1/chat/completions";

// Map i18next language codes to human-readable language names for the prompt
const LANGUAGE_LABELS = {
  en: "anglais",
  fr: "français",
  es: "espagnol",
  de: "allemand",
  ar: "arabe",
};

async function generateQuizFromText(topic, numQuestions = 3, language = "fr") {
  if (!process.env.MISTRAL_API_KEY) {
    throw new Error("MISTRAL_API_KEY is not set in environment");
  }

  const langLabel = LANGUAGE_LABELS[language] || LANGUAGE_LABELS.fr;

  const prompt = `Tu es une IA qui crée des quiz pédagogiques pour des élèves.
Le niveau (primaire, collège, lycée, université) et le sujet sont décrits dans ce texte : "${topic}".

LANGUE DE SORTIE : toutes les questions, options, explications et textes doivent être rédigés en ${langLabel}.

Ta tâche : générer ${numQuestions} questions à choix multiples pour vérifier que l'élève a bien compris.

CONTRAINTES TRÈS IMPORTANTES :
- Chaque question doit avoir EXACTEMENT 4 options.
- Il doit y avoir UNE SEULE bonne réponse par question.
- Le champ "correctIndex" doit être un nombre entre 0 et 3 qui pointe vers la bonne option dans le tableau "options".
- Les autres options doivent être plausibles mais fausses (pas des nombres totalement au hasard).
- Pour les questions de math (équations, calculs, etc.) :
  - la bonne réponse doit être le bon résultat numérique,
  - les autres réponses doivent être des nombres proches ou des erreurs classiques (par exemple erreur de signe ou de calcul),
  - ne propose pas des réponses comme "1", "3", "5", "18" si elles n'ont aucun lien avec l'exercice.
- N'écris pas la question complète comme une option (les options doivent être des réponses possibles, pas des copies de l'énoncé).
- Utilise un ton bienveillant, simple et clair, adapté au niveau indiqué.

INTÉGRATION AVEC WOLFRAM (très important) :
- Quand c'est pertinent (maths, sciences, géographie, conversions, histoire, chimie, physique, etc.), ajoute un champ "wolframInput" pour chaque question.
- "wolframInput" doit être une requête que Wolfram Alpha comprend, par exemple :
  - "solve x^2 - 5x + 6 = 0" (ou une forme équivalente),
  - "explain photosynthesis",
  - "population of France vs Germany",
  - "convert 100 km to miles",
  - "timeline of World War II",
  - "balance H2 + O2 -> H2O",
  - "Newton's second law".
- Si tu ne trouves pas de requête pertinente pour une question, tu peux mettre "wolframInput": null.

Répond UNIQUEMENT avec du JSON valide, sans explication autour, avec ce format exact :
{
  "questions": [
    {
      "question": "Question en français ?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "wolframInput": "requête Wolfram Alpha pertinente ou null"
    }
  ]
}

IMPORTANT : "options" doit être un tableau JSON avec EXACTEMENT 4 éléments séparés, PAS une seule chaîne de caractères avec des virgules.
Exemple CORRECT : "options": ["Réponse 1", "Réponse 2", "Réponse 3", "Réponse 4"]
Exemple INCORRECT : "options": ["Réponse 1, Réponse 2, Réponse 3, Réponse 4"]`;

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

  // Normalise shape to { question, options, correct, wolframInput? }
  const questions = parsed.questions.map((q) => {
    let options = q.options;

    // Fix common LLM mistake: options as single comma-separated string instead of array
    if (Array.isArray(options) && options.length === 1 && typeof options[0] === 'string') {
      const singleString = options[0];
      // If it contains commas, likely the LLM put all options in one string
      if (singleString.includes(',')) {
        options = singleString.split(',').map(opt => opt.trim());
      }
    }

    // Ensure we have exactly 4 options
    if (!Array.isArray(options) || options.length !== 4) {
      console.warn('[QuizRoute] Question has invalid options array:', q);
      // Fallback to placeholder options if format is completely wrong
      options = ['Option A', 'Option B', 'Option C', 'Option D'];
    }

    return {
      question: q.question,
      options,
      correct: typeof q.correctIndex === "number" ? q.correctIndex : 0,
      wolframInput:
        typeof q.wolframInput === "string" && q.wolframInput.trim().length > 0
          ? q.wolframInput.trim()
          : null,
    };
  });

  return { questions };
}

router.post("/from-text", async (req, res) => {
  try {
    const { topic, numQuestions, language } = req.body || {};
    if (!topic || typeof topic !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'topic'" });
    }

    const count = typeof numQuestions === "number" ? numQuestions : 3;
    const lang = typeof language === "string" && language.trim()
      ? language.trim().slice(0, 2)
      : "fr";
    const quiz = await generateQuizFromText(topic, count, lang);
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
    const { themeId, numQuestions, language } = req.body || {};
    if (!themeId || typeof themeId !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'themeId'" });
    }

    const themeData = getThemeData(themeId);
    if (!themeData) {
      return res.status(404).json({ error: "Theme not found" });
    }

    const count = typeof numQuestions === "number" ? numQuestions : 3;
    const topic = themeData.prompt;
    const lang = typeof language === "string" && language.trim()
      ? language.trim().slice(0, 2)
      : "fr";
    const quiz = await generateQuizFromText(topic, count, lang);
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
