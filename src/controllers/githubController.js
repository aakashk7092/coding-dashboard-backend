import { fetchGithubStats } from "../services/githubService.js";

const profileMap = {
  aakash: {
    githubUsername: "aakashk7092",
  },
};

export async function getGithubStats(req, res) {
  try {
    const data = await fetchGithubStats(req.params.username, profileMap);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "GitHub fetch failed" });
  }
}
