import express from "express";
import { fetchGitHubLanguages, fetchGitHubRepos } from "../services/githubService.js";

const router = express.Router();

router.get("/languages", async (req, res) => {
  try {
    const data = await fetchGitHubLanguages();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/repos", async (req, res) => {
  try {
    const data = await fetchGitHubRepos();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
