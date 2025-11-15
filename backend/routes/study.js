import express from "express";
import { StudyCoachAgent } from "../agents/StudyCoachAgent.js";

const router = express.Router();
const studyCoachAgent = new StudyCoachAgent();

/**
 * POST /api/study/plan
 * 
 * Request body:
 * {
 *   "userId": "user123",
 *   "availableTime": 90  // in minutes
 * }
 */
router.post("/plan", async (req, res) => {
  try {
    const { userId, availableTime } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (!availableTime) {
      return res.status(400).json({ error: "availableTime is required (in minutes)" });
    }

    const result = await studyCoachAgent.run({
      userId,
      availableTime: parseInt(availableTime, 10),
    });

    if (result.error) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error("Error creating study plan:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
