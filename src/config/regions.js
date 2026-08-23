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
    regionId: "sati-vidisha",
    name: "SATI Vidisha",
    type: "campus",
    country: "India",
    state: "Madhya Pradesh",
    district: "Vidisha",
    active: true,
    defaultCenterLat: 23.517770,
    defaultCenterLng: 77.819339,
    zoomLevel: 16,
    tagline: "Pilot campus region for a scalable civic reporting network.",
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

export const defaultRegionId = import.meta.env.VITE_DEFAULT_REGION_ID || "sati-vidisha";

export function getRegion(regionId = defaultRegionId) {
  return regions.find((region) => region.regionId === regionId) || regions[0];
}

export function getZonesForRegion(regionId = defaultRegionId) {
  return zones.filter((zone) => zone.regionId === regionId && zone.active);
}
