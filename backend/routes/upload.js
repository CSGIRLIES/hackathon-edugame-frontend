import express from "express";
import multer from "multer";
import { DocumentIngestionAgent } from "../agents/DocumentIngestionAgent.js";

const router = express.Router();
const upload = multer();

const ingestionAgent = new DocumentIngestionAgent();

// POST /api/upload
// multipart/form-data with fields:
// - userId: string
// - file: single uploaded document (pdf, docx, txt, image for OCR, ...)
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { userId } = req.body;
    const file = req.file;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (!file) {
      return res.status(400).json({ error: "file is required" });
    }

    const result = await ingestionAgent.run({
      userId,
      filename: file.originalname || "uploaded-file",
      fileBuffer: file.buffer,
    });

    if (result.error) {
      return res.status(400).json(result);
    }

    return res.json({ status: "success", ...result });
  } catch (err) {
    console.error("[UploadRoute] Error ingesting document:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
