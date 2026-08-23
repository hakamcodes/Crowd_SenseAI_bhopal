import { defaultRegionId, regions, zones } from "../config/regions.js";
import { sampleComplaints, sampleVotes } from "../config/sampleData.js";

const STORAGE_KEY = "crowdsense-ai-prototype-v1";

const demoUsers = [
  {
    uid: "demo-user",
    name: "Demo Citizen",
    email: "citizen@crowdsense.local",
    photoURL: "",
    role: "citizen",
    zoneNumber: null,
    regionPreference: defaultRegionId,
    createdAt: new Date().toISOString(),
  },
  {
    uid: "demo-admin",
    name: "Demo Super Admin",
    email: "admin@crowdsense.local",
    photoURL: "",
    role: "super-admin",
    zoneNumber: null,
    regionPreference: defaultRegionId,
    createdAt: new Date().toISOString(),
  },
  {
    uid: "demo-senior",
    name: "Demo Senior Officer",
    email: "demo-senior@crowdsense.local",
    photoURL: "",
    role: "senior-officer",
    zoneNumber: 8,
    regionPreference: defaultRegionId,
    createdAt: new Date().toISOString(),
  },
  {
    uid: "demo-junior",
    name: "Demo Junior Officer",
    email: "demo-junior@crowdsense.local",
    photoURL: "",
    role: "junior-officer",
    zoneNumber: 8,
    regionPreference: defaultRegionId,
    createdAt: new Date().toISOString(),
  },
];

// Matches the demo-senior/demo-junior users above, both on real Zone 8 (which
// the "Ravindra Nath Tagore" seed complaint in sampleComplaints also falls
// under) so the demo accounts have something to see immediately.
const demoOfficers = [
  {
    email: "demo-senior@crowdsense.local",
    name: "Demo Senior Officer",
    roleTier: "senior-officer",
    zoneNumber: 8,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    email: "demo-junior@crowdsense.local",
    name: "Demo Junior Officer",
    roleTier: "junior-officer",
    zoneNumber: 8,
    active: true,
    createdAt: new Date().toISOString(),
  },
];

function initialState() {
  return {
    users: demoUsers,
    regions,
    zones,
    complaints: sampleComplaints,
    votes: sampleVotes,
    adminNotes: [],
    auditLog: [],
    officers: demoOfficers,
    notifications: [],
  };
}

export function readStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = initialState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw);
    return { ...initialState(), ...parsed };
  } catch {
    const seeded = initialState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

export function writeStore(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("crowdsense-store-updated"));
}

export function resetPrototypeStore() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("crowdsense-store-updated"));
}

export function upsertUser(user) {
  const store = readStore();
  const existing = store.users.find((item) => item.uid === user.uid);
  const users = existing
    ? store.users.map((item) => (item.uid === user.uid ? { ...item, ...user } : item))
    : [...store.users, user];
  writeStore({ ...store, users });
  return user;
}
