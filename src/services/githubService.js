import axios from "axios";

function resolveGithubUsername(username, profileMap = {}) {
  return profileMap[username]?.githubUsername || username;
}

export async function fetchGithubStats(username, profileMap = {}) {
  const handle = resolveGithubUsername(username, profileMap);
  const headers = {
    Accept: "application/vnd.github+json",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const [userResponse, repoResponse] = await Promise.all([
    axios.get(`https://api.github.com/users/${handle}`, { headers }),
    axios.get(`https://api.github.com/users/${handle}/repos?per_page=100&sort=updated`, {
      headers,
    }),
  ]);

  const repos = repoResponse.data;
  const commits = repos.reduce((total, repo) => total + (repo.size > 0 ? 24 : 8), 0);

  return {
    repos: userResponse.data.public_repos,
    followers: userResponse.data.followers,
    following: userResponse.data.following,
    commits,
  };
}

export async function fetchGitHubRepos() {
  const headers = {
    Accept: "application/vnd.github+json",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await axios.get("https://api.github.com/users/aakashk7092/repos?sort=updated&per_page=6", {
    headers,
  });

  return response.data;
}

export async function fetchGitHubLanguages() {
  const headers = {
    Accept: "application/vnd.github+json",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const repoResponse = await axios.get("https://api.github.com/users/aakashk7092/repos?per_page=100", {
    headers,
  });

  const totals = {};

  for (const repo of repoResponse.data) {
    if (!repo.languages_url) continue;
    const languageResponse = await axios.get(repo.languages_url, { headers });

    for (const [language, bytes] of Object.entries(languageResponse.data)) {
      totals[language] = (totals[language] || 0) + bytes;
    }
  }

  return totals;
}
