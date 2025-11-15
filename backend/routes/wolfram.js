import express from "express";
import fetch from "node-fetch";

const router = express.Router();

const WOLFRAM_API_URL = "https://api.wolframalpha.com/v2/query";
const MISTRAL_CHAT_URL = "https://api.mistral.ai/v1/chat/completions";

/**
 * POST /api/wolfram/query
 *
 * Body:
 * {
 *   "input": "expression ou question Wolfram",
 *   "params"?: { ...options avancées passées à Wolfram Alpha ... }
 * }
 *
 * Utilisation prévue :
 * - Vérifier / évaluer une expression Wolfram
 * - Récupérer une explication textuelle (pods) venant de Wolfram Alpha
 */
router.post("/query", async (req, res) => {
  try {
    const appId = process.env.WOLFRAM_APPID;
    if (!appId) {
      return res.status(500).json({
        error: "WOLFRAM_APPID is not set in environment",
      });
    }

    const { input, params = {} } = req.body || {};

    if (!input || typeof input !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'input'" });
    }

    const searchParams = new URLSearchParams({
      appid: appId,
      input,
      output: "JSON",
      // On peut ajuster ces options plus tard pour cibler certains pods
      ...Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ),
    });

    const url = `${WOLFRAM_API_URL}?${searchParams.toString()}`;

    const wolframRes = await fetch(url);
    if (!wolframRes.ok) {
      const text = await wolframRes.text().catch(() => "");
      console.error("[WolframRoute] HTTP error from Wolfram Alpha:", text);
      return res
        .status(502)
        .json({ error: "Wolfram Alpha API error", status: wolframRes.status });
    }

    const data = await wolframRes.json();

    // data.queryresult contient les pods (résultat, explications, etc.)
    const queryResult = data.queryresult || {};
    const pods = Array.isArray(queryResult.pods) ? queryResult.pods : [];

    // On essaie de trouver un résultat principal :
    // 1) pod primary=true
    // 2) pod dont l'id est "result"
    // 3) pod dont l'id ou le titre contient "solution" ou "root"
    let primaryPod =
      pods.find((p) => p.primary) ||
      pods.find((p) => (p.id || '').toLowerCase() === 'result') ||
      pods.find((p) => {
        const id = (p.id || '').toLowerCase();
        const title = (p.title || '').toLowerCase();
        return id.includes('solution') || id.includes('root') || title.includes('solution');
      }) ||
      pods[0];

    let primaryPlaintext = '';
    if (primaryPod && Array.isArray(primaryPod.subpods) && primaryPod.subpods[0]) {
      primaryPlaintext = (primaryPod.subpods[0].plaintext || '').trim();
    }

    // On construit une liste d'explications textuelles simples
    const explanations = pods
      .map((pod) => {
        const title = pod.title || pod.id || "";
        const firstSubpod = Array.isArray(pod.subpods) ? pod.subpods[0] : null;
        const plaintext = firstSubpod?.plaintext || "";
        return plaintext
          ? {
              title,
              plaintext,
            }
          : null;
      })
      .filter(Boolean);

    // Si on n'a pas réussi à trouver un primaryResult clair, on prend au moins
    // le plaintext du premier élément d'explication disponible.
    if (!primaryPlaintext && explanations.length > 0) {
      primaryPlaintext = explanations[0].plaintext.trim();
    }

    return res.json({
      status: "success",
      input,
      primaryResult: primaryPlaintext,
      explanations,
      // On renvoie aussi une version brute si tu veux exploiter tous les pods côté frontend
      raw: queryResult,
    });
  } catch (err) {
    console.error("[WolframRoute] Unexpected error", err);
    return res.status(500).json({ error: "Failed to query Wolfram Alpha" });
  }
});

/**
 * POST /api/wolfram/assist
 *
 * Body:
 * {
 *   "theme": "Visualization & Graphics",
 *   "task": "Tracer une courbe simple",
 *   "details": "y = sin(x), intervalle de -π à π"
 * }
 *
 * Objectif : transformer une description en français + un thème
 * en une requête Wolfram Alpha/Wolfram Language unique, par ex. :
 *   "plot sin(x) from -pi to pi"
 */
router.post("/assist", async (req, res) => {
  try {
    const { theme, task, details } = req.body || {};

    if (!process.env.MISTRAL_API_KEY) {
      return res
        .status(500)
        .json({ error: "MISTRAL_API_KEY is not set in environment" });
    }

    if (!theme && !task && !details) {
      return res.status(400).json({
        error: "Missing input: provide at least 'theme' or 'task' or 'details'",
      });
    }

    const descriptionParts = [];
    if (theme) descriptionParts.push(`Thème : ${theme}.`);
    if (task) descriptionParts.push(`Tâche décrite par l'élève : ${task}.`);
    if (details) descriptionParts.push(`Détails supplémentaires : ${details}.`);

    const description = descriptionParts.join("\n");

    const prompt = `Tu es un·e assistant·e qui aide des collégien·nes/lycéen·nes à utiliser Wolfram Alpha / Wolfram Language sans connaître la syntaxe exacte.

On te donne :
${description}

Ta tâche : produire UNE SEULE requête pour Wolfram Alpha, sous forme de texte, qui permette de répondre à la demande de l'élève.

CONTRAINTES IMPORTANTES :
- La requête doit être adaptée au thème (par ex. visualisation, données, machine learning, géographie, etc.).
- Utilise le style de requêtes Wolfram Alpha simples, par exemple :
  - "plot sin(x) from -pi to pi"
  - "population of France vs Germany"
  - "solve x^2 - 5x + 6 = 0"
  - "convert 100 km to miles"
  - "explain photosynthesis"
  - "balance H2 + O2 -> H2O".
- Ne renvoie PAS de texte en français dans la requête finale, sauf si nécessaire pour un nom propre.
- Ne rajoute pas d'explication autour.

Répond UNIQUEMENT avec du JSON valide, sans explication autour, exactement au format :
{
  "wolframInput": "requête pour Wolfram Alpha ici"
}`;

    const mistralRes = await fetch(MISTRAL_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "open-mistral-7b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 400,
      }),
    });

    if (!mistralRes.ok) {
      const text = await mistralRes.text().catch(() => "");
      console.error("[WolframAssist] Mistral error:", text);
      return res
        .status(502)
        .json({ error: "Mistral API error", status: mistralRes.status });
    }

    const mistralJson = await mistralRes.json();
    const content = mistralJson.choices?.[0]?.message?.content || "";
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error("[WolframAssist] No JSON block in Mistral response", content);
      return res.status(500).json({ error: "No JSON block in Mistral response" });
    }

    const parsed = JSON.parse(match[0]);
    const wolframInput =
      typeof parsed.wolframInput === "string" && parsed.wolframInput.trim()
        ? parsed.wolframInput.trim()
        : null;

    if (!wolframInput) {
      return res.status(500).json({ error: "Mistral did not return wolframInput" });
    }

    return res.json({ status: "success", wolframInput });
  } catch (err) {
    console.error("[WolframAssist] Unexpected error", err);
    return res.status(500).json({ error: "Failed to generate wolframInput" });
  }
});

export default router;
