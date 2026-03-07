import express from "express";
import { fetchLeetCodeStats } from "../services/leetcodeService.js";
import { getLeetcodeStats } from "../controllers/leetcodeController.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await fetchLeetCodeStats();
    res.json(data);          // ✅ route sends response
  } catch (e) {
    console.error("LeetCode route error:", e.message);
    res.status(500).json({ error: "LeetCode fetch failed" });
  }
});

router.get("/:username", getLeetcodeStats);

export default router;
