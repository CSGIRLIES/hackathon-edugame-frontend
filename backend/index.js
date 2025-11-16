import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import quizRouter from "./routes/quiz.js";
import uploadRouter from "./routes/upload.js";
import studyRouter from "./routes/study.js";
import wolframRouter from "./routes/wolfram.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: ['http://localhost:3000', 'https://pawfriend.vercel.app'],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "hackathon-edugame-backend" });
});

app.use("/api/quiz", quizRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/study", studyRouter);
app.use("/api/wolfram", wolframRouter);

app.use((err, _req, res, _next) => {
  console.error("[Backend] Unexpected error", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`[Backend] Server listening on port ${PORT}`);
});
