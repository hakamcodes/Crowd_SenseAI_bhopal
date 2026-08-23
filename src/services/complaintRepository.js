import { addDoc, collection, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase.js";
import { readStore, writeStore } from "./prototypeStore.js";
import { toDate } from "../utils/date.js";

function uid(prefix) {
  return `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)}`;
}

export async function listComplaints() {
  if (isFirebaseConfigured) {
    const snapshot = await getDocs(query(collection(db, "complaints"), orderBy("createdAt", "desc")));
    return snapshot.docs.map((item) => normalizeComplaint({ complaintId: item.id, ...item.data() }));
  }
  return readStore().complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function normalizeComplaint(complaint) {
  const createdAt = toDate(complaint.createdAt)?.toISOString() || new Date().toISOString();
  const updatedAt = toDate(complaint.updatedAt)?.toISOString() || createdAt;
  return {
    supportCount: 0,
    status: "Open",
    adminNotes: "",
    resolutionImageData: "",
    resolvedAt: "",
    timeline: [{ label: "Reported", at: createdAt }],
    ...complaint,
    createdAt,
    updatedAt,
    timeline: (complaint.timeline?.length ? complaint.timeline : [{ label: "Reported", at: createdAt }]).map((event) => ({
      ...event,
      at: toDate(event.at)?.toISOString() || createdAt,
    })),
  };
}

export async function createComplaint(payload) {
  const now = new Date().toISOString();
  const complaint = {
    supportCount: 0,
    status: "Open",
    adminNotes: "",
    resolutionImageData: "",
    resolvedAt: "",
    timeline: [{ label: "Reported", at: now }],
    createdAt: now,
    updatedAt: now,
    ...payload,
  };

  if (isFirebaseConfigured) {
    const docRef = await addDoc(collection(db, "complaints"), complaint);
    return { complaintId: docRef.id, ...complaint };
  }

  const store = readStore();
  const localComplaint = {
    complaintId: uid("cmp"),
    ...complaint,
  };
  writeStore({ ...store, complaints: [localComplaint, ...store.complaints] });
  return localComplaint;
}

export async function updateComplaint(complaintId, patch, actorId = "system") {
  const now = new Date().toISOString();
  if (isFirebaseConfigured) {
    await updateDoc(doc(db, "complaints", complaintId), { ...patch, updatedAt: now });
    return;
  }

  const store = readStore();
  const complaints = store.complaints.map((item) => {
    if (item.complaintId !== complaintId) return item;
    const timeline =
      patch.status && patch.status !== item.status
        ? [...(item.timeline || []), { label: patch.status, at: now }]
        : item.timeline || [];
    return { ...item, ...patch, timeline, updatedAt: now, resolvedAt: patch.status === "Resolved" ? now : item.resolvedAt };
  });
  const auditLog = [
    {
      actionId: uid("act"),
      complaintId,
      actorId,
      actionType: "update_complaint",
      oldValue: "",
      newValue: JSON.stringify(patch),
      createdAt: now,
    },
    ...store.auditLog,
  ];
  writeStore({ ...store, complaints, auditLog });
}

export async function supportComplaint(complaintId, userId) {
  const store = readStore();
  const existing = store.votes.find((vote) => vote.complaintId === complaintId && vote.userId === userId);
  if (existing) return { alreadySupported: true };
  const now = new Date().toISOString();
  const vote = { voteId: uid("vote"), complaintId, userId, createdAt: now };
  const complaints = store.complaints.map((item) =>
    item.complaintId === complaintId ? { ...item, supportCount: (item.supportCount || 0) + 1, updatedAt: now } : item,
  );
  writeStore({ ...store, votes: [vote, ...store.votes], complaints });
  return { alreadySupported: false };
}

export async function addAdminNote(complaintId, adminId, note) {
  const store = readStore();
  const now = new Date().toISOString();
  const adminNote = { noteId: uid("note"), complaintId, adminId, note, createdAt: now };
  const complaints = store.complaints.map((item) =>
    item.complaintId === complaintId ? { ...item, adminNotes: note, updatedAt: now } : item,
  );
  writeStore({ ...store, adminNotes: [adminNote, ...store.adminNotes], complaints });
}
