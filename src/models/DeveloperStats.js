import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    name: String,
    icon: String,
    createdAt: String,
    stars: Number,
    platform: String,
  },
  { _id: false }
);

const chartPointSchema = new mongoose.Schema(
  {
    label: String,
    value: Number,
    date: String,
    count: Number,
  },
  { _id: false }
);

const DeveloperStatsSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    profile: {
      name: String,
      role: String,
      githubUsername: String,
      leetcodeUsername: String,
      codechefUsername: String,
      unstopUsername: String,
    },
    overview: {
      totalQuestions: { type: Number, default: 0 },
      totalActiveDays: { type: Number, default: 0 },
      totalContests: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      maxStreak: { type: Number, default: 0 },
    },
    leetcode: {
      solved: { type: Number, default: 0 },
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
      ranking: { type: Number, default: 0 },
      activeDays: { type: Number, default: 0 },
      totalSubmissions: { type: Number, default: 0 },
      submissionCalendar: [chartPointSchema],
      badges: [badgeSchema],
      contestRating: { type: Number, default: 0 },
      contests: { type: Number, default: 0 },
      contestGlobalRanking: { type: Number, default: 0 },
      contestTopPercentage: { type: Number, default: 0 },
      contestHistory: [chartPointSchema],
    },
    github: {
      repos: { type: Number, default: 0 },
      followers: { type: Number, default: 0 },
      following: { type: Number, default: 0 },
      commits: { type: Number, default: 0 },
    },
    codechef: {
      rating: { type: Number, default: 0 },
      stars: { type: Number, default: 0 },
      badges: [badgeSchema],
      contests: { type: Number, default: 0 },
      submissionDays: { type: Number, default: 0 },
    },
    unstop: {
      highlights: { type: Number, default: 0 },
      competitions: { type: Number, default: 0 },
      badges: [badgeSchema],
      upcomingBadges: [badgeSchema],
    },
    awards: [badgeSchema],
    analytics: {
      problemsOverTime: [chartPointSchema],
      platformShare: [chartPointSchema],
      contestHistory: [chartPointSchema],
      dsaBreakdown: [chartPointSchema],
    },
    recentActivity: [{ type: String }],
    metadata: {
      platformStatus: {
        github: { type: String, default: "" },
        leetcode: { type: String, default: "" },
        codechef: { type: String, default: "" },
        unstop: { type: String, default: "" },
      },
      sources: {
        github: { type: String, default: "" },
        leetcode: { type: String, default: "" },
        codechef: { type: String, default: "" },
        summary: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        unstop: { type: String, default: "" },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("DeveloperStats", DeveloperStatsSchema);
