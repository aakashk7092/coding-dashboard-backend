import DeveloperStats from "../models/DeveloperStats.js";
import { hasDatabaseConnection } from "../config/db.js";
import { fetchGithubStats } from "../services/githubService.js";
import { fetchLeetcodeStats } from "../services/leetcodeService.js";
import { fetchCodechefStats } from "../services/codechefService.js";
import { fetchUnstopStats } from "../services/unstopService.js";

const STALE_MS = 1000 * 60 * 60;

const profileMap = {
  aakash: {
    name: "Aakash Kumar",
    role: "Software Engineer | Full Stack Developer | DSA Enthusiast",
    githubUsername: "aakashk7092",
    leetcodeUsername: "aakashkumar2005",
    codechefUsername: "aakashk7092",
    unstopUsername: "aakaskum19946",
  },
};

function getProfile(username) {
  return (
    profileMap[username] || {
      name: username,
      role: "Developer",
      githubUsername: username,
      leetcodeUsername: username,
      codechefUsername: username,
      unstopUsername: username,
    }
  );
}

function getFallbackStats() {
  return {
    github: {
      repos: 0,
      followers: 0,
      following: 0,
      commits: 0,
    },
    leetcode: {
      solved: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      ranking: 0,
      activeDays: 0,
      currentStreak: 0,
      maxStreak: 0,
      totalSubmissions: 0,
      submissionCalendar: [],
      contestRating: 0,
      contests: 0,
      contestGlobalRanking: 0,
      contestTopPercentage: 0,
      contestHistory: [],
      badges: [],
    },
    codechef: {
      rating: 0,
      stars: 0,
      badges: [],
      contests: 0,
      submissionDays: 0,
      contestHistory: [],
    },
    unstop: {
      highlights: 0,
      competitions: 0,
      badges: [],
      upcomingBadges: [],
    },
  };
}

function buildAwards(leetcode, codechef, unstop) {
  return [
    ...(leetcode.badges || []).slice(0, 6),
    ...(codechef.badges || []).slice(0, 3),
    ...(unstop.badges || []).slice(0, 3),
  ].map((badge) => ({
    ...badge,
    icon: badge.icon || "",
  }));
}

function getSettledValue(result, fallbackValue) {
  return result.status === "fulfilled" ? result.value : fallbackValue;
}

function getSettledError(result, label) {
  if (result.status === "fulfilled") {
    return "";
  }

  return `${label} live fetch failed: ${result.reason?.message || "Unknown error"}`;
}

export async function collectDashboardStats(username) {
  const profile = getProfile(username);
  const fallback = getFallbackStats();
  const [githubResult, leetcodeResult, codechefResult, unstopResult] = await Promise.allSettled([
    fetchGithubStats(username, profileMap),
    fetchLeetcodeStats(username, profileMap),
    fetchCodechefStats(username, profileMap),
    fetchUnstopStats(username, profileMap),
  ]);

  const github = getSettledValue(githubResult, fallback.github);
  const leetcode = getSettledValue(leetcodeResult, fallback.leetcode);
  const codechef = getSettledValue(codechefResult, fallback.codechef);
  const unstop = getSettledValue(unstopResult, fallback.unstop);
  const platformErrors = [
    getSettledError(githubResult, "GitHub"),
    getSettledError(leetcodeResult, "LeetCode"),
    getSettledError(codechefResult, "CodeChef"),
    getSettledError(unstopResult, "Unstop"),
  ].filter(Boolean);

  const overview = {
    totalQuestions: leetcode.solved,
    totalActiveDays: leetcode.activeDays,
    totalContests: leetcode.contests + codechef.contests,
    currentStreak: leetcode.currentStreak,
    maxStreak: leetcode.maxStreak,
  };

  const problemsOverTime = [
    { label: "LeetCode", value: leetcode.solved },
    { label: "GitHub", value: github.repos },
    { label: "CodeChef", value: codechef.submissionDays },
    { label: "Unstop", value: unstop.highlights },
  ];

  const platformShare = [
    { label: "LeetCode", value: leetcode.solved },
    { label: "GitHub", value: github.repos },
    { label: "CodeChef", value: codechef.submissionDays },
    { label: "Unstop", value: unstop.highlights },
  ];

  const dsaBreakdown = [
    { label: "Easy", value: leetcode.easy },
    { label: "Medium", value: leetcode.medium },
    { label: "Hard", value: leetcode.hard },
  ];

  const recentActivity = [
    `LeetCode current streak: ${leetcode.currentStreak} days`,
    `LeetCode contests attended: ${leetcode.contests}`,
    `GitHub public repositories: ${github.repos}`,
    `CodeChef submission days detected: ${codechef.submissionDays}`,
    `Unstop competitive highlights: ${unstop.highlights}`,
  ];

  return {
    username,
    profile,
    overview,
    leetcode,
    github,
    codechef,
    unstop,
    awards: buildAwards(leetcode, codechef, unstop),
    analytics: {
      problemsOverTime,
      platformShare,
      contestHistory: leetcode.contestHistory?.length ? leetcode.contestHistory : codechef.contestHistory || [],
      dsaBreakdown,
    },
    recentActivity,
    metadata: {
      platformStatus: {
        github: githubResult.status,
        leetcode: leetcodeResult.status,
        codechef: codechefResult.status,
        unstop: unstopResult.status,
      },
      sources: {
        linkedin: "LinkedIn public analytics are not reliably available without authenticated API access.",
        unstop: unstopResult.status === "rejected" ? getSettledError(unstopResult, "Unstop") : "",
        github: githubResult.status === "rejected" ? getSettledError(githubResult, "GitHub") : "",
        leetcode: leetcodeResult.status === "rejected" ? getSettledError(leetcodeResult, "LeetCode") : "",
        codechef: codechefResult.status === "rejected" ? getSettledError(codechefResult, "CodeChef") : "",
        summary: platformErrors.length > 0 ? `Partial live fetch completed with ${platformErrors.length} platform failure(s).` : "",
      },
    },
    updatedAt: new Date(),
  };
}

export async function refreshDeveloperStats(username) {
  const normalizedUsername = username.toLowerCase();
  const liveStats = await collectDashboardStats(normalizedUsername);

  if (!hasDatabaseConnection()) {
    return liveStats;
  }

  return DeveloperStats.findOneAndUpdate(
    { username: normalizedUsername },
    liveStats,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
}

function isDashboardIncomplete(existing) {
  if (!existing) {
    return true;
  }

  if (!existing.leetcode) {
    return true;
  }

  if (typeof existing.leetcode.totalSubmissions !== "number") {
    return true;
  }

  if (!Array.isArray(existing.leetcode.submissionCalendar)) {
    return true;
  }

  if (existing.leetcode.activeDays > 0 && existing.leetcode.submissionCalendar.length === 0) {
    return true;
  }

  return false;
}

export async function getDashboardStats(req, res) {
  const username = req.params.username.toLowerCase();

  try {
    if (!hasDatabaseConnection()) {
      const liveStats = await collectDashboardStats(username);
      return res.json(liveStats);
    }

    const existing = await DeveloperStats.findOne({ username }).lean();
    const isStale =
      existing?.updatedAt &&
      Date.now() - new Date(existing.updatedAt).getTime() > STALE_MS;
    const needsRefresh = isDashboardIncomplete(existing);

    if (!existing || isStale || needsRefresh) {
      const refreshed = await refreshDeveloperStats(username);
      return res.json(refreshed);
    }

    res.json(existing);
  } catch (error) {
    console.error(`Dashboard fetch failed for ${username}:`, error.message);
    try {
      const fallback = await collectDashboardStats(username);
      res.json(fallback);
    } catch (fallbackError) {
      res.status(500).json({ error: fallbackError.message || "Dashboard fetch failed" });
    }
  }
}

export async function refreshDashboardStats(req, res) {
  const username = req.params.username.toLowerCase();

  try {
    const refreshed = await refreshDeveloperStats(username);
    res.json(refreshed);
  } catch (error) {
    res.status(500).json({ error: error.message || "Dashboard refresh failed" });
  }
}
