import { fetchLeetcodeStats } from "../services/leetcodeService.js";

const profileMap = {
  aakash: {
    leetcodeUsername: "aakashkumar2005",
  },
};

export async function getLeetcodeStats(req, res) {
  try {
    const data = await fetchLeetcodeStats(req.params.username, profileMap);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "LeetCode fetch failed" });
  }
}
