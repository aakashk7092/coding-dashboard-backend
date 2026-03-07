import axios from "axios";

function resolveHackerRankUsername(username, profileMap = {}) {
  return profileMap[username]?.hackerrankUsername || username;
}

export async function fetchHackerRankStats(username, profileMap = {}) {
  const handle = resolveHackerRankUsername(username, profileMap);
  const response = await axios.get(`https://www.hackerrank.com/profile/${handle}`, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  const html = response.data;
  const badgeBlocks = [
    ...html.matchAll(
      /<text class="badge-title"[^>]*>(.*?)<\/text>[\s\S]*?<g class="star-section"[\s\S]*?<\/g><\/svg>/g
    ),
  ];

  const badgeDetails = badgeBlocks.map((match) => ({
    name: match[1].trim(),
    stars: (match[0].match(/class="badge-star"/g) || []).length,
    platform: "HackerRank",
  }));

  return {
    badges: badgeDetails.length,
    badgeDetails,
    stars: badgeDetails.reduce((max, badge) => Math.max(max, badge.stars || 0), 0),
    problems: 0,
  };
}
