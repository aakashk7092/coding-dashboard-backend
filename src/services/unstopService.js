import axios from "axios";

const UNSTOP_ASSET_BASE = "https://d8it4huxumps7.cloudfront.net/";

function resolveUnstopUsername(username, profileMap = {}) {
  return profileMap[username]?.unstopUsername || username;
}

function normalizeIconPath(badgeTrigger = {}) {
  const slug = badgeTrigger?.badges?.badge_slug;
  const seoImage = badgeTrigger?.badges?.seo_image;

  if (seoImage) {
    return seoImage;
  }

  if (!slug) {
    return "";
  }

  return slug.startsWith("http") ? slug : `${UNSTOP_ASSET_BASE}${slug}`;
}

export async function fetchUnstopStats(username, profileMap = {}) {
  const handle = resolveUnstopUsername(username, profileMap);
  const response = await axios.get(`https://unstop.com/api/gamification/get-user-badges/global/0/20/${handle}`, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json,text/plain,*/*",
    },
  });

  const earnedBadges = Array.isArray(response.data?.data) ? response.data.data : [];
  const upcomingBadges = Array.isArray(response.data?.upcoming_badge) ? response.data.upcoming_badge : [];
  const uniqueCompetitionIds = new Set(
    earnedBadges
      .filter((badge) => badge?.entity_type && badge.entity_type !== "d2c_global")
      .map((badge) => badge.entity_id)
      .filter(Boolean)
  );

  return {
    highlights: earnedBadges.length,
    competitions: uniqueCompetitionIds.size,
    badges: earnedBadges.map((badge) => ({
      name: badge?.badge_trigger?.badge_name || "Unstop Badge",
      createdAt: badge?.created_at ? new Date(badge.created_at).toISOString().slice(0, 10) : "",
      description: badge?.badge_trigger?.description || "",
      icon: normalizeIconPath(badge?.badge_trigger),
      platform: "Unstop",
      tag: badge?.tag_name || "",
      action: badge?.action || 0,
    })),
    upcomingBadges: upcomingBadges.map((badge) => ({
      name: badge?.badge_name || "Upcoming Badge",
      count: badge?.count || 0,
      icon: normalizeIconPath({ badges: badge?.badges || {} }),
      platform: "Unstop",
    })),
  };
}
