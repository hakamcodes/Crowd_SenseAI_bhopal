import { issueCategories, priorities, resolveDepartmentForCategory } from "../config/regions.js";

const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-opus-5";

const RISK_LEVELS = ["Low", "Medium", "High", "Critical"];

const CLASSIFICATION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "category",
    "subcategory",
    "priority",
    "severityScore",
    "summary",
    "aiSuggestedDepartment",
    "recommendedAction",
    "tags",
    "confidence",
    "risks",
    "civicImpactScore",
    "imageObservations",
    "duplicateContext",
  ],
  properties: {
    category: { type: "string", enum: issueCategories },
    subcategory: { type: "string", description: "A more specific label within the category, e.g. 'sunken manhole' for Road Damage." },
    priority: { type: "string", enum: priorities },
    severityScore: { type: "integer", description: "Severity from 1 (trivial) to 10 (emergency)." },
    summary: { type: "string", description: "One or two sentence civic summary of the issue." },
    aiSuggestedDepartment: { type: "string", description: "The department that seems responsible, for admin transparency only." },
    recommendedAction: { type: "string", description: "A short, concrete next step for the responsible department." },
    tags: { type: "array", items: { type: "string" } },
    confidence: { type: "number", description: "Classification confidence from 0 to 1." },
    risks: {
      type: "object",
      additionalProperties: false,
      required: ["publicHealth", "safety", "environmental", "traffic"],
      properties: {
        publicHealth: { type: "string", enum: RISK_LEVELS },
        safety: { type: "string", enum: RISK_LEVELS },
        environmental: { type: "string", enum: RISK_LEVELS },
        traffic: { type: "string", enum: RISK_LEVELS },
      },
    },
    civicImpactScore: { type: "integer", description: "Overall civic impact from 0 (negligible) to 100 (city-wide emergency)." },
    imageObservations: { type: "string", description: "What is visibly observed in the attached photo, if one was provided." },
    duplicateContext: { type: "string", description: "Any hint from the description that this might be a recurring or already-reported issue." },
  },
};

function clamp(value, min, max, fallback) {
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

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
  { category: "Illegal Construction", words: ["illegal construction", "encroachment", "unauthorized"] },
  { category: "Stray Animal", words: ["stray", "dog", "cattle", "animal"] },
  { category: "Tree / Garden Maintenance", words: ["tree", "garden", "park", "branch"] },
  { category: "Traffic / Signage", words: ["traffic", "signal", "signage", "sign board"] },
];

function choosePriority(description, category) {
  const text = description.toLowerCase();
  if (/(fire|shock|injury|accident|danger|critical|severe|exposed wire)/.test(text)) return "Critical";
  if (/(blocked|flood|pothole|unsafe|leak|stagnant|night)/.test(text)) return "High";
  if (["Road Damage", "Blocked Drain", "Electrical", "Safety Hazard"].includes(category)) return "High";
  return "Medium";
}

function assessRisks(text, category) {
  const risks = { publicHealth: "Low", safety: "Low", environmental: "Low", traffic: "Low" };
  if (/(sewer|drain|garbage|waste|sanitation|toilet|stray|dead animal)/.test(text) || ["Sanitation", "Garbage", "Blocked Drain", "Stray Animal"].includes(category)) {
    risks.publicHealth = "Medium";
  }
  if (/(fire|shock|exposed wire|injury|accident|collapse)/.test(text) || category === "Safety Hazard") {
    risks.safety = "High";
  }
  if (/(flood|waterlogging|stagnant|overflow|chemical|smoke)/.test(text) || category === "Waterlogging") {
    risks.environmental = "Medium";
  }
  if (/(pothole|traffic|signal|blocked road|accident)/.test(text) || ["Road Damage", "Traffic / Signage"].includes(category)) {
    risks.traffic = "Medium";
  }
  return risks;
}

function civicImpactFromPriority(priority) {
  return { Critical: 90, High: 70, Medium: 45, Low: 20 }[priority] || 40;
}

function heuristicClassify({ description, zoneName, regionId }) {
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
  const confidence = matched?.score ? Math.min(0.95, 0.62 + matched.score * 0.12) : 0.48;

  return {
    category,
    subcategory: "",
    priority,
    severityScore: Math.round(civicImpactFromPriority(priority) / 10),
    summary: summary || `Issue reported${zoneName ? ` near ${zoneName}` : ""}.`,
    confidence,
    aiSuggestedDepartment: resolveDepartmentForCategory(category, regionId),
    recommendedAction: "Route to the responsible department for on-site inspection.",
    tags: [...new Set([category.toLowerCase(), ...(zoneName ? [zoneName.toLowerCase()] : [])])],
    risks: assessRisks(text, category),
    civicImpactScore: civicImpactFromPriority(priority),
    imageObservations: "",
    duplicateContext: "",
    source: "heuristic",
  };
}

function normalizeClassification(result, { description, zoneName, regionId }) {
  const category = issueCategories.includes(result.category) ? result.category : "Other";
  const priority = priorities.includes(result.priority) ? result.priority : "Medium";
  return {
    category,
    subcategory: result.subcategory || "",
    priority,
    severityScore: clamp(result.severityScore, 1, 10, Math.round(civicImpactFromPriority(priority) / 10)),
    summary: result.summary || description,
    confidence: clamp(result.confidence, 0, 1, 0.6),
    aiSuggestedDepartment: result.aiSuggestedDepartment || resolveDepartmentForCategory(category, regionId),
    recommendedAction: result.recommendedAction || "Route to the responsible department for on-site inspection.",
    tags: Array.isArray(result.tags) ? result.tags : [],
    risks: {
      publicHealth: RISK_LEVELS.includes(result.risks?.publicHealth) ? result.risks.publicHealth : "Low",
      safety: RISK_LEVELS.includes(result.risks?.safety) ? result.risks.safety : "Low",
      environmental: RISK_LEVELS.includes(result.risks?.environmental) ? result.risks.environmental : "Low",
      traffic: RISK_LEVELS.includes(result.risks?.traffic) ? result.risks.traffic : "Low",
    },
    civicImpactScore: clamp(result.civicImpactScore, 0, 100, civicImpactFromPriority(priority)),
    imageObservations: result.imageObservations || "",
    duplicateContext: result.duplicateContext || "",
    source: result.source || "claude",
  };
}

async function callClaude({ description, imageData, zoneName, regionName }) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.includes("replace")) return null;

  const model = import.meta.env.VITE_ANTHROPIC_MODEL || DEFAULT_MODEL;
  const promptText = `You are triaging a civic complaint for ${regionName}${zoneName ? ` (${zoneName})` : ""}. Description: ${description}`;
  const content = [{ type: "text", text: promptText }];
  if (imageData) {
    content.push({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: imageData.split(",")[1] || imageData },
    });
  }

  // Direct browser calls require this header (same trust tradeoff already
  // accepted by shipping the Firebase key client-side). For production, set
  // VITE_BACKEND_API_BASE_URL to proxy this call through a server instead.
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      output_config: { effort: "low", format: { type: "json_schema", schema: CLASSIFICATION_SCHEMA } },
      messages: [{ role: "user", content }],
    }),
  });

  if (!response.ok) throw new Error(`Claude request failed (${response.status}).`);
  const data = await response.json();
  const text = data.content?.find((block) => block.type === "text")?.text;
  if (!text) throw new Error("Claude returned no classification text.");
  return JSON.parse(text);
}

export async function classifyComplaint({ description, imageData, zoneName, regionName, regionId }) {
  const backendUrl = import.meta.env.VITE_BACKEND_API_BASE_URL;

  if (backendUrl) {
    try {
      const response = await fetch(`${backendUrl}/ai/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, imageData, zoneName, regionName, regionId }),
      });
      if (!response.ok) throw new Error("AI backend request failed.");
      return normalizeClassification(await response.json(), { description, zoneName, regionId });
    } catch (error) {
      console.warn("AI backend failed, trying direct Claude call.", error);
    }
  }

  try {
    const result = await callClaude({ description, imageData, zoneName, regionName });
    if (result) return normalizeClassification(result, { description, zoneName, regionId });
  } catch (error) {
    console.warn("Claude classification failed, using heuristic fallback.", error);
  }

  return heuristicClassify({ description, zoneName, regionId });
}

export function generateAdminSummary(complaints) {
  const open = complaints.filter((item) => !["Resolved", "Rejected", "Duplicate"].includes(item.status)).length;
  const high = complaints.filter((item) => ["High", "Critical"].includes(item.aiPriority)).length;
  const topZone = Object.entries(
    complaints.reduce((acc, item) => ({ ...acc, [item.zoneName]: (acc[item.zoneName] || 0) + 1 }), {}),
  ).sort((a, b) => b[1] - a[1])[0];

  return `${open} unresolved issues need attention, including ${high} high-priority reports. ${topZone ? `${topZone[0]} is currently the most active zone.` : "No hotspot has emerged yet."}`;
}

// Narrates already-computed deterministic aggregate stats (never invents
// ward/zone/department numbers itself). Falls back to the plain template
// summary above when Claude is unavailable.
export async function generateCivicBriefing(stats, region) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const fallback = () =>
    `${stats.open} open issues across ${region.name}, including ${stats.highPriority} high-priority and ${stats.slaBreached} SLA-breached. Top hotspot ward: ${stats.topWard || "none yet"}.`;

  if (!apiKey || apiKey.includes("replace")) return fallback();

  try {
    const model = import.meta.env.VITE_ANTHROPIC_MODEL || DEFAULT_MODEL;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model,
        max_tokens: 400,
        output_config: { effort: "low" },
        messages: [
          {
            role: "user",
            content: `Write a 2-3 sentence civic intelligence briefing for ${region.name} municipal administrators using only these already-computed statistics (do not invent any numbers not given here): ${JSON.stringify(stats)}`,
          },
        ],
      }),
    });
    if (!response.ok) throw new Error("Briefing request failed.");
    const data = await response.json();
    const text = data.content?.find((block) => block.type === "text")?.text;
    return text || fallback();
  } catch (error) {
    console.warn("Civic briefing generation failed, using deterministic summary.", error);
    return fallback();
  }
}
