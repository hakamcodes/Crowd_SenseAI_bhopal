import { distanceMeters } from "../utils/geo.js";
import { jaccardSimilarity } from "../utils/text.js";

const RECENT_WINDOW_DAYS = 21;

export function findLikelyDuplicate(candidate, complaints) {
  const createdAt = new Date(candidate.createdAt || Date.now()).getTime();
  const scored = complaints
    .filter((complaint) => complaint.regionId === candidate.regionId)
    .filter((complaint) => !["Resolved", "Rejected", "Duplicate"].includes(complaint.status))
    .map((complaint) => {
      const sameZone = complaint.zoneId && complaint.zoneId === candidate.zoneId;
      const categoryMatch = complaint.aiCategory === candidate.aiCategory;
      const textScore = jaccardSimilarity(candidate.description, complaint.description);
      const daysApart = Math.abs(createdAt - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const recent = daysApart <= RECENT_WINDOW_DAYS;
      const geoDistance =
        candidate.latitude && complaint.latitude
          ? distanceMeters(
              { latitude: candidate.latitude, longitude: candidate.longitude },
              { latitude: complaint.latitude, longitude: complaint.longitude },
            )
          : Infinity;
      const nearby = sameZone || geoDistance <= 180;
      const score =
        (sameZone ? 0.28 : 0) +
        (nearby ? 0.18 : 0) +
        (categoryMatch ? 0.24 : 0) +
        Math.min(0.24, textScore * 0.42) +
        (recent ? 0.06 : 0);
      return { complaint, score, textScore, nearby, categoryMatch };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score < 0.58) return null;
  return best;
}
