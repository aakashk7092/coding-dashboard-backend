import fetch from "node-fetch";

const GITHUB_USERNAME = "aakashk7092";

function getHeaders() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("GITHUB_TOKEN missing");
  }

  return {
    Authorization: `Bearer ${token}`,
    "User-Agent": "coding-dashboard",
  };
}

// ------------------ LANGUAGES ------------------
export async function fetchGitHubLanguages() {
  const headers = getHeaders();

  const reposRes = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`,
    { headers }
  );

  const repos = await reposRes.json();
  const totals = {};

  for (const repo of repos) {
    if (!repo.languages_url) continue;

    const langRes = await fetch(repo.languages_url, { headers });
    const langs = await langRes.json();

    for (const lang in langs) {
      if (!["C++", "Java", "HTML", "CSS"].includes(lang)) continue;
      totals[lang] = (totals[lang] || 0) + langs[lang];
    }
  }

  return totals;
}

// ------------------ REPOS ------------------
export async function fetchGitHubRepos() {
  const headers = getHeaders();

  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`,
    { headers }
  );

  return res.json();
}
