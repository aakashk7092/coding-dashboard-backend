import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());

/* =========================
   LEETCODE API
========================= */
const LEETCODE_USERNAME = "aakashkumar2005";

app.get("/api/leetcode", async (req, res) => {
  try {
    const response = await fetch(
      `https://leetcode-stats-api.herokuapp.com/${LEETCODE_USERNAME}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "LeetCode API failed" });
  }
});

/* =========================
   GITHUB LANGUAGE API (REAL BYTES)
========================= */
const GITHUB_USERNAME = "aakashk7092";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;


app.get("/api/github-languages", async (req, res) => {
  try {
    const reposRes = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "User-Agent": "coding-dashboard",
        },
      }
    );

    const repos = await reposRes.json();

    // ✅ FIX 1: totals define karo
    const totals = {};

    for (const repo of repos) {
      if (!repo.languages_url) continue;

      const langRes = await fetch(repo.languages_url, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "User-Agent": "coding-dashboard",
        },
      });

      const langs = await langRes.json();

      for (const lang in langs) {
        // ✅ FIX 2: unwanted languages remove
        if (!["C++", "Java", "HTML", "CSS"].includes(lang)) continue;

        totals[lang] = (totals[lang] || 0) + langs[lang];
      }
    }

    res.json(totals);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "GitHub language fetch failed" });
  }
});
/* =========================
   GITHUB REPOS API
========================= */
app.get("/api/github-repos", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "User-Agent": "coding-dashboard",
        },
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "GitHub repo fetch failed" });
  }
});



/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("✅ Backend running on port", PORT);
});

