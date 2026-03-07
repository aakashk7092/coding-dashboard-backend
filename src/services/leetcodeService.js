import axios from "axios";

const LEETCODE_BASE = "https://leetcode.com";

function resolveLeetcodeUsername(username, profileMap = {}) {
  return profileMap[username]?.leetcodeUsername || username;
}

function normalizeIcon(icon) {
  if (!icon) return "";
  return icon.startsWith("http") ? icon : `${LEETCODE_BASE}${icon}`;
}

function parseSubmissionCalendar(submissionCalendar) {
  if (!submissionCalendar) {
    return [];
  }

  let parsed = {};

  try {
    parsed = JSON.parse(submissionCalendar);
  } catch {
    parsed = {};
  }

  return Object.entries(parsed).map(([timestamp, count]) => ({
    date: new Date(Number(timestamp) * 1000).toISOString().slice(0, 10),
    count: Number(count) || 0,
  }));
}

export async function fetchLeetcodeStats(username, profileMap = {}) {
  const handle = resolveLeetcodeUsername(username, profileMap);

  const query = {
    query: `
      query userStats($username: String!) {
        matchedUser(username: $username) {
          profile {
            ranking
          }
          badges {
            displayName
            icon
            creationDate
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
          userCalendar {
            activeYears
            streak
            totalActiveDays
            submissionCalendar
          }
        }
        userContestRanking(username: $username) {
          rating
          attendedContestsCount
          globalRanking
          topPercentage
          totalParticipants
        }
        userContestRankingHistory(username: $username) {
          attended
          rating
          ranking
          contest {
            title
            startTime
          }
        }
      }
    `,
    variables: { username: handle },
  };

  const response = await axios.post("https://leetcode.com/graphql", query, {
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0",
    },
  });

  const matchedUser = response.data?.data?.matchedUser;
  const contestRanking = response.data?.data?.userContestRanking;
  const contestHistory = Array.isArray(response.data?.data?.userContestRankingHistory)
    ? response.data.data.userContestRankingHistory
    : [];
  const submissionCalendar = parseSubmissionCalendar(matchedUser?.userCalendar?.submissionCalendar);
  const stats = matchedUser?.submitStatsGlobal?.acSubmissionNum || [];

  const solved = { solved: 0, easy: 0, medium: 0, hard: 0 };

  for (const item of stats) {
    if (item.difficulty === "All") solved.solved = item.count;
    if (item.difficulty === "Easy") solved.easy = item.count;
    if (item.difficulty === "Medium") solved.medium = item.count;
    if (item.difficulty === "Hard") solved.hard = item.count;
  }

  return {
    ...solved,
    ranking: matchedUser?.profile?.ranking || 0,
    activeDays: matchedUser?.userCalendar?.totalActiveDays || 0,
    currentStreak: matchedUser?.userCalendar?.streak || 0,
    maxStreak: matchedUser?.userCalendar?.streak || 0,
    totalSubmissions: submissionCalendar.reduce((sum, item) => sum + item.count, 0),
    submissionCalendar,
    contestRating: Math.round(contestRanking?.rating || 0),
    contests: contestRanking?.attendedContestsCount || 0,
    contestGlobalRanking: contestRanking?.globalRanking || 0,
    contestTopPercentage: contestRanking?.topPercentage || 0,
    contestHistory: contestHistory
      .filter((entry) => entry?.attended)
      .map((entry) => ({
        label: entry?.contest?.title || "Contest",
        value: Math.round(entry?.rating || 0),
        date: entry?.contest?.startTime ? new Date(entry.contest.startTime * 1000).toISOString() : "",
        ranking: entry?.ranking || 0,
      })),
    badges: (matchedUser?.badges || []).map((badge) => ({
      name: badge.displayName,
      icon: normalizeIcon(badge.icon),
      createdAt: badge.creationDate,
      platform: "LeetCode",
    })),
  };
}

export async function fetchLeetCodeStats() {
  const stats = await fetchLeetcodeStats("aakash", {
    aakash: { leetcodeUsername: "aakashkumar2005" },
  });

  return {
    username: "aakashkumar2005",
    solved: {
      easy: stats.easy,
      medium: stats.medium,
      hard: stats.hard,
      total: stats.solved,
    },
  };
}
