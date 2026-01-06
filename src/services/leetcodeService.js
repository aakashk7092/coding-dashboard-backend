import fetch from "node-fetch";

const USERNAME = "aakashkumar2005";

export async function fetchLeetCodeStats() {
  const res = await fetch(
    `https://leetcode-stats-api.herokuapp.com/${USERNAME}`
  );
  return await res.json();
}
