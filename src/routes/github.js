import express from "express";
import { fetchGitHubRepos, fetchGitHubLanguages } from "../services/githubService.js";
import { getGithubStats } from "../controllers/githubController.js";

const router = express.Router();

// 👉 /api/github/repos
router.get("/repos", async (req, res) => {
  try {
    const data = await fetchGitHubRepos();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "GitHub repo fetch failed" });
  }
});

// 👉 /api/github/languages
router.get("/languages", async (req, res) => {
  try {
    const data = await fetchGitHubLanguages();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "GitHub language fetch failed" });
  }
});

router.get("/stats/:username", getGithubStats);

export default router;
