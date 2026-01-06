import express from "express";
import { fetchLeetCodeStats } from "../services/leetcodeService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await fetchLeetCodeStats();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "LeetCode fetch failed" });
  }
});

export default router;
