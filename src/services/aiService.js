import { issueCategories } from "../config/regions.js";

const categoryRules = [
  { category: "Road Damage", words: ["pothole", "road", "damaged road", "crack", "asphalt"] },
  { category: "Garbage", words: ["garbage", "trash", "waste", "dump", "litter"] },
  { category: "Streetlight", words: ["streetlight", "light", "dark", "lamp"] },
  { category: "Waterlogging", words: ["waterlogging", "flood", "rain water", "stagnant"] },
  { category: "Blocked Drain", words: ["drain", "sewer", "blocked", "clog"] },
  { category: "Water Leak", words: ["leak", "pipe", "tap", "water"] },
  { category: "Electrical", words: ["wire", "electric", "spark", "power", "switch"] },
  { category: "Hostel Maintenance", words: ["hostel", "room", "mess", "bathroom"] },
  { category: "Sanitation", words: ["toilet", "sanitation", "smell", "dirty"] },
  { category: "Broken Furniture", words: ["bench", "chair", "table", "furniture", "broken"] },
  { category: "Safety Hazard", words: ["danger", "hazard", "unsafe", "injury", "exposed"] },
];

const departmentByCategory = {
  "Road Damage": "Civil Maintenance",
  Garbage: "Sanitation Team",
  Streetlight: "Electrical Department",
  Waterlogging: "Civil Maintenance",
  "Blocked Drain": "Sanitation Team",
  "Water Leak": "Water Works",
  Electrical: "Electrical Department",
  "Hostel Maintenance": "Hostel Administration",
  Sanitation: "Sanitation Team",
  "Broken Furniture": "Campus Administration",
  "Safety Hazard": "Security Office",
  Other: "Campus Administration",
};

function choosePriority(description, category) {
  const text = description.toLowerCase();
  if (/(fire|shock|injury|accident|danger|critical|severe|exposed wire)/.test(text)) return "Critical";
  if (/(blocked|flood|pothole|unsafe|leak|stagnant|night)/.test(text)) return "High";
  if (["Road Damage", "Blocked Drain", "Electrical", "Safety Hazard"].includes(category)) return "High";
  return "Medium";
}

function heuristicClassify({ description, zoneName }) {
  const text = description.toLowerCase();
  const matched = categoryRules
    .map((rule) => ({
      category: rule.category,
      score: rule.words.reduce((total, word) => total + (text.includes(word) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score)[0];

  const category = matched?.score ? matched.category : "Other";
  const priority = choosePriority(description, category);
  const summaryBase = description.trim().replace(/\s+/g, " ");
  const summary = summaryBase.length > 110 ? `${summaryBase.slice(0, 107)}...` : summaryBase;
  return {
    category,
    priority,
    summary: summary || `Issue reported${zoneName ? ` near ${zoneName}` : ""}.`,
    confidence: matched?.score ? Math.min(0.95, 0.62 + matched.score * 0.12) : 0.48,
    suggestedZone: zoneName || "",
    suggestedDepartment: departmentByCategory[category],
    tags: [...new Set([category.toLowerCase(), ...(zoneName ? [zoneName.toLowerCase()] : [])])],
    source: "heuristic",
  };
}

export async function classifyComplaint({ description, imageData, zoneName, regionName }) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const backendUrl = import.meta.env.VITE_BACKEND_API_BASE_URL;

  if (backendUrl) {
    try {
      const response = await fetch(`${backendUrl}/ai/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, imageData, zoneName, regionName }),
      });
      if (!response.ok) throw new Error("AI backend request failed.");
      return await response.json();
    } catch (error) {
      console.warn("AI backend failed, using heuristic fallback.", error);
    }
  }

  if (apiKey && !apiKey.includes("replace")) {
    try {
      const prompt = `Return strict JSON for a civic complaint. Categories: ${issueCategories.join(", ")}. Region: ${regionName}. Zone: ${zoneName}. Description: ${description}`;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }, ...(imageData ? [{ inlineData: { mimeType: "image/jpeg", data: imageData.split(",")[1] } }] : [])] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        },
      );
      if (!response.ok) throw new Error("Gemini request failed.");
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return { ...JSON.parse(text), source: "gemini" };
    } catch (error) {
      console.warn("Gemini classification failed, using heuristic fallback.", error);
    }
  }

  return heuristicClassify({ description, zoneName });
}

export function generateAdminSummary(complaints) {
  const open = complaints.filter((item) => !["Resolved", "Rejected", "Duplicate"].includes(item.status)).length;
  const high = complaints.filter((item) => ["High", "Critical"].includes(item.aiPriority)).length;
  const topZone = Object.entries(
    complaints.reduce((acc, item) => ({ ...acc, [item.zoneName]: (acc[item.zoneName] || 0) + 1 }), {}),
  ).sort((a, b) => b[1] - a[1])[0];

  return `${open} unresolved issues need attention, including ${high} high-priority reports. ${topZone ? `${topZone[0]} is currently the most active zone.` : "No hotspot has emerged yet."}`;
}
