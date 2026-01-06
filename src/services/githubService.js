import fetch from "node-fetch";

const GITHUB_USERNAME = "aakashk7092";

export async function fetchGitHubLanguages() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("GITHUB_TOKEN missing");
  }

  const reposRes = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "coding-dashboard",
      },
    }
  );

  const repos = await reposRes.json();
  const totals = {};

  for (const repo of repos) {
    if (!repo.languages_url) continue;

    const langRes = await fetch(repo.languages_url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "coding-dashboard",
      },
    });

    const langs = await langRes.json();

    for (const lang in langs) {
      if (!["C++", "Java", "HTML", "CSS"].includes(lang)) continue;
      totals[lang] = (totals[lang] || 0) + langs[lang];
    }
  }

  return totals;
}

export async function fetchGitHubRepos() {
  const token = process.env.GITHUB_TOKEN;

  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "coding-dashboard",
      },
    }
  );

  return res.json();
}
