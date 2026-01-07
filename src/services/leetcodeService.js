import axios from "axios";

// 🔒 hard-coded username (no .env needed)
const USERNAME = "aakashkumar2005";

export async function fetchLeetCodeStats() {
  const query = {
    query: `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `,
    variables: { username: USERNAME }
  };

  const res = await axios.post(
    "https://leetcode.com/graphql",
    query,
    { headers: { "Content-Type": "application/json" } }
  );

  const stats =
    res.data.data.matchedUser.submitStatsGlobal.acSubmissionNum;

  let solved = { easy: 0, medium: 0, hard: 0, total: 0 };

  stats.forEach((item) => {
    if (item.difficulty === "Easy") solved.easy = item.count;
    if (item.difficulty === "Medium") solved.medium = item.count;
    if (item.difficulty === "Hard") solved.hard = item.count;
    if (item.difficulty === "All") solved.total = item.count;
  });

  return {
    username: USERNAME,
    solved
  };
}
