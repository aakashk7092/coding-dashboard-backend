import fetch from "node-fetch";

const USERNAME = "aakashkumar2005";

export async function getLeetCodeStats(req, res) {
  try {
    const r = await fetch(
      `https://leetcode-stats-api.herokuapp.com/${USERNAME}`
    );
    const d = await r.json();

    res.json({
      totalSolved: d.totalSolved,
      acceptanceRate: d.acceptanceRate,
      easySolved: d.easySolved,
      totalEasy: d.totalEasy,
      mediumSolved: d.mediumSolved,
      totalMedium: d.totalMedium,
      hardSolved: d.hardSolved,
      totalHard: d.totalHard,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "LeetCode fetch failed" });
  }
}
