import axios from "axios";
import { load } from "cheerio";

function resolveCodechefUsername(username, profileMap = {}) {
  return profileMap[username]?.codechefUsername || username;
}

function ratingToStars(rating) {
  if (!rating || rating < 1400) return 0;
  if (rating < 1600) return 1;
  if (rating < 1800) return 2;
  if (rating < 2000) return 3;
  if (rating < 2200) return 4;
  if (rating < 2500) return 5;
  if (rating < 3000) return 6;
  return 7;
}

export async function fetchCodechefStats(username, profileMap = {}) {
  const handle = resolveCodechefUsername(username, profileMap);
  const response = await axios.get(`https://www.codechef.com/users/${handle}`, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  const html = response.data;
  const $ = load(html);
  const ratingHistoryMatch = html.match(/var all_rating = (\[[\s\S]*?\]);/);
  const submissionsMatch = html.match(/var userDailySubmissionsStats = (\[[\s\S]*?\]);/);

  let ratingHistory = [];
  let submissionDays = [];

  try {
    ratingHistory = ratingHistoryMatch ? JSON.parse(ratingHistoryMatch[1]) : [];
  } catch {
    ratingHistory = [];
  }

  try {
    submissionDays = submissionsMatch ? JSON.parse(submissionsMatch[1]) : [];
  } catch {
    submissionDays = [];
  }

  const currentRating = ratingHistory.length > 0 ? Number.parseInt(ratingHistory.at(-1).rating, 10) || 0 : 0;
  const badges = [];

  $(".download_icon--container").each((_, element) => {
    const icon = $(element).attr("data-url");
    if (icon) {
      badges.push({
        name: `CodeChef Badge ${badges.length + 1}`,
        icon,
        platform: "CodeChef",
      });
    }
  });

  return {
    rating: currentRating,
    stars: ratingToStars(currentRating),
    contests: ratingHistory.length,
    badges,
    submissionDays: submissionDays.length,
    contestHistory: ratingHistory.map((item, index) => ({
      label: item.code || `Contest ${index + 1}`,
      value: Number.parseInt(item.rating, 10) || 0,
      date: item.getyear || "",
    })),
  };
}
