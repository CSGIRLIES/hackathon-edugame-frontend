import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import { createWorker } from "tesseract.js";
import { fileTypeFromBuffer } from "file-type";
import fetch from "node-fetch";
import { createRequire } from "module";
import { JSDOM } from "jsdom";

// ===== Set up JSDOM for PDF parsing =====
const { window } = new JSDOM();
global.window = window;
global.document = window.document;
global.DOMMatrix = window.DOMMatrix || class DOMMatrix {
  constructor(args) {
    if (Array.isArray(args)) {
      this.matrix = args;
    } else {
      this.matrix = [1, 0, 0, 1, 0, 0];
    }
  }
  // minimal methods if needed
};
global.CanvasRenderingContext2D = window.CanvasRenderingContext2D;
global.Image = window.Image;

// ===== PDF parsing =====
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

// ===== Vector Store (JSON) =====
const DB_PATH = path.resolve("data/vectorstore.json");
let vectorCache = null;

async function loadVectorDB() {
  if (vectorCache) return vectorCache;
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    vectorCache = JSON.parse(raw);
  } catch {
    vectorCache = { vectors: [], docs: {} };
  }
  return vectorCache;
}

async function saveVectorDB() {
  if (!vectorCache) return;
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(vectorCache, null, 2));
}

// ===== Embeddings =====
const GROQ_EMB_URL = "https://api.groq.com/openai/v1/embeddings";

async function embedGroq(texts) {
  const res = await fetch(GROQ_EMB_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: texts,
    }),
  });

  const json = await res.json();
  return json.data.map((d) => d.embedding);
}

function pseudoEmbed(text) {
  const out = new Array(128).fill(0);
  for (let i = 0; i < text.length; i++) {
    out[i % 128] += text.charCodeAt(i) % 23;
  }
  const norm = Math.sqrt(out.reduce((s, v) => s + v * v, 0)) || 1;
  return out.map((v) => v / norm);
}

async function embedTexts(texts) {
  if (process.env.GROQ_KEY) {
    try {
      return await embedGroq(texts);
    } catch (e) {
      console.warn("Groq embedding failed, using fallback", e);
    }
  }
  return texts.map((t) => pseudoEmbed(t));
}

// ===== Document parsing =====
async function parseDocument(buffer, filename) {
  const detected = await fileTypeFromBuffer(buffer).catch(() => null);
  const mime = detected?.mime || "";

  // PDF handling v2
  if (mime === "application/pdf" || filename.endsWith(".pdf")) {
    const parser = new PDFParse({ data: buffer }); // buffer input
    const result = await parser.getText();
    return result.text || "";
  }

  // DOCX handling
  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filename.endsWith(".docx")
  ) {
    const res = await mammoth.extractRawText({ buffer });
    return res.value || "";
  }

  // Plain text
  try {
    const text = buffer.toString("utf8");
    if (text.length > 30) return text;
  } catch {}

  // OCR fallback
  try {
    const worker = await createWorker();
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const { data } = await worker.recognize(buffer);
    await worker.terminate();
    return data.text || "";
  } catch (e) {
    console.warn("OCR failed", e);
  }

  return "";
}

// ===== Chunking =====
function chunkText(text, size = 500, overlap = 80) {
  if (!text || text.length === 0) return [];

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) chunks.push(chunk);

    start = end - overlap;
    if (start <= start) start = end; // prevents stuck loop
  }

  return chunks;
}



// ===== DocumentIngestionAgent =====
export class DocumentIngestionAgent {
  name = "DocumentIngestionAgent";
  description =
    "Extracts text from uploaded documents, chunks them, embeds them, and stores them in the vector database for RAG.";

  inputs = {
    userId: "string",
    filename: "string",
    fileBuffer: "buffer",
  };

  async run({ userId, filename, fileBuffer }) {
    console.log("[IngestionAgent] Starting ingestion for", filename);

    const text = await parseDocument(fileBuffer, filename);
    if (!text || text.length < 20) {
      return { error: "Failed to extract meaningful text." };
    }

    const chunks = chunkText(text);
    const embeddings = await embedTexts(chunks);

    const db = await loadVectorDB();
    const ids = chunks.map((_, i) => `${userId}::${filename}::${i}`);

    ids.forEach((id, index) => {
      db.vectors.push({
        id,
        emb: embeddings[index],
      });

      db.docs[id] = {
        id,
        userId,
        filename,
        text: chunks[index],
      };
    });

    await saveVectorDB();

    console.log("[IngestionAgent] Stored chunks:", ids.length);

    return {
      status: "success",
      chunksStored: ids.length,
    };
  }
}
