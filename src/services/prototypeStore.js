import { regions, zones } from "../config/regions.js";
import { sampleComplaints, sampleVotes } from "../config/sampleData.js";

const STORAGE_KEY = "crowdsense-ai-prototype-v1";

const demoUsers = [
  {
    uid: "demo-user",
    name: "Demo Citizen",
    email: "citizen@crowdsense.local",
    photoURL: "",
    role: "citizen",
    regionPreference: "sati-vidisha",
    createdAt: new Date().toISOString(),
  },
  {
    uid: "demo-admin",
    name: "Demo Admin",
    email: "admin@crowdsense.local",
    photoURL: "",
    role: "admin",
    regionPreference: "sati-vidisha",
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
