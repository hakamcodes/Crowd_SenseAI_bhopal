import { generateAdminSummary } from "./aiService.js";

export function buildAnalytics(complaints) {
  const countBy = (field) =>
    complaints.reduce((acc, item) => {
      const key = item[field] || "Unmapped";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

  const unresolved = complaints.filter((item) => !["Resolved", "Rejected", "Duplicate"].includes(item.status));
  const resolved = complaints.filter((item) => item.status === "Resolved");
  const duplicateClusters = complaints.reduce((acc, item) => {
    if (!item.duplicateGroupId) return acc;
    acc[item.duplicateGroupId] = (acc[item.duplicateGroupId] || 0) + 1;
    return acc;
  }, {});

  return {
    total: complaints.length,
    open: complaints.filter((item) => item.status === "Open").length,
    inProgress: complaints.filter((item) => item.status === "In Progress").length,
    resolved: resolved.length,
    unresolved: unresolved.length,
    byZone: countBy("zoneName"),
    byCategory: countBy("aiCategory"),
    byPriority: countBy("aiPriority"),
    byStatus: countBy("status"),
    duplicateClusters: Object.entries(duplicateClusters).filter(([, count]) => count > 1).length,
    topProblemZones: Object.entries(countBy("zoneName")).sort((a, b) => b[1] - a[1]).slice(0, 5),
    topCategories: Object.entries(countBy("aiCategory")).sort((a, b) => b[1] - a[1]).slice(0, 5),
    adminSummary: generateAdminSummary(complaints),
  };
}
