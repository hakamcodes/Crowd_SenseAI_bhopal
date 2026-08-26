import { bhopalDepartments, resolveBhopalDepartment } from "./departments.bhopal.js";

export const issueCategories = [
  "Road Damage",
  "Garbage",
  "Streetlight",
  "Waterlogging",
  "Blocked Drain",
  "Water Leak",
  "Electrical",
  "Hostel Maintenance",
  "Sanitation",
  "Broken Furniture",
  "Safety Hazard",
  "Illegal Construction",
  "Stray Animal",
  "Tree / Garden Maintenance",
  "Traffic / Signage",
  "Other",
];

export const priorities = ["Low", "Medium", "High", "Critical"];

export const complaintStatuses = [
  "Open",
  "Triaged",
  "In Progress",
  "Resolved",
  "Duplicate",
  "Rejected",
];

export const departments = [
  "Civil Maintenance",
  "Electrical Department",
  "Sanitation Team",
  "Hostel Administration",
  "Water Works",
  "Security Office",
  "Campus Administration",
];

export const regions = [
  {
    regionId: "bhopal",
    name: "Bhopal",
    type: "city",
    geoMode: "polygon",
    country: "India",
    state: "Madhya Pradesh",
    district: "Bhopal",
    municipality: "Bhopal Municipal Corporation",
    active: true,
    defaultCenterLat: 23.2599,
    defaultCenterLng: 77.4126,
    zoomLevel: 12,
    tagline: "Bhopal civic-intelligence pilot for the Cloud Impact Lab Hackathon.",
    departments: bhopalDepartments,
    gis: {
      wardsUrl: "/gis/bhopal/wards.geojson",
      zonesUrl: "/gis/bhopal/zones.geojson",
      cityBoundaryUrl: "/gis/bhopal/city-boundary.geojson",
      wardOfficesUrl: "/gis/bhopal/ward-offices.geojson",
      zoneOfficesUrl: "/gis/bhopal/zone-offices.geojson",
    },
  },
  {
    regionId: "sati-vidisha",
    name: "SATI Vidisha",
    type: "campus",
    geoMode: "circle",
    country: "India",
    state: "Madhya Pradesh",
    district: "Vidisha",
    municipality: "SATI Campus Administration",
    active: true,
    defaultCenterLat: 23.517770,
    defaultCenterLng: 77.819339,
    zoomLevel: 16,
    tagline: "Legacy pilot campus region, kept as a demo configuration.",
    departments,
  },
];

export const zones = [
  {
    zoneId: "sati-main-gate",
    regionId: "sati-vidisha",
    name: "Main Gate",
    latitude: 23.520581,
    longitude: 77.819194,
    radiusMeters: 45,
    type: "entry",
    landmark: "Main entrance and security point",
    active: true,
  },
  {
    zoneId: "sati-admin-block",
    regionId: "sati-vidisha",
    name: "Administrative Block",
    latitude: 23.520891,
    longitude: 77.820835,
    radiusMeters: 110,
    type: "administration",
    landmark: "Office and academic administration",
    active: true,
  },
  {
    zoneId: "sati-hostel-zone1",
    regionId: "sati-vidisha",
    name: "Girls Hostel Zone",
    latitude: 23.515628,
    longitude: 77.818796,
    radiusMeters: 80,
    type: "residential",
    landmark: "Student hostels",
    active: true,
  },
  {
    zoneId: "sati-hostel-zone2",
    regionId: "sati-vidisha",
    name: "Boys Hostel Zone",
    latitude: 23.514508,
    longitude: 77.820104,
    radiusMeters: 110,
    type: "residential",
    landmark: "Student hostels",
    active: true,
  },
  {
    zoneId: "sati-sports-ground",
    regionId: "sati-vidisha",
    name: "Sports Ground",
    latitude: 23.518063,
    longitude: 77.818378,
    radiusMeters: 160,
    type: "public-space",
    landmark: "Sports and open grounds",
    active: true,
  },
];

export const defaultRegionId = import.meta.env.VITE_DEFAULT_REGION_ID || "bhopal";

export function getRegion(regionId = defaultRegionId) {
  return regions.find((region) => region.regionId === regionId) || regions[0];
}

export function getZonesForRegion(regionId = defaultRegionId) {
  return zones.filter((zone) => zone.regionId === regionId && zone.active);
}

export function getDepartmentsForRegion(regionId = defaultRegionId) {
  return getRegion(regionId).departments || departments;
}

const satiDepartmentByCategory = {
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

// Deterministic category -> department routing, kept out of the AI's hands.
// The AI may only *suggest* a department (shown for transparency); this map
// always decides the department actually stored on a complaint.
export function resolveDepartmentForCategory(category, regionId = defaultRegionId) {
  if (regionId === "bhopal") return resolveBhopalDepartment(category);
  return satiDepartmentByCategory[category] || departments[departments.length - 1];
}
