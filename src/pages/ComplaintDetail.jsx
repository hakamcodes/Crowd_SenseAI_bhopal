import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, ThumbsUp } from "lucide-react";
import MapPanel from "../components/map/MapPanel.jsx";
import Timeline from "../components/complaints/Timeline.jsx";
import { PriorityBadge, StatusBadge } from "../components/ui/Badge.jsx";
import { formatDateTime } from "../utils/date.js";
import { useAuth } from "../state/AuthContext.jsx";
import { useData } from "../state/DataContext.jsx";
import { useToast } from "../state/ToastContext.jsx";

export default function ComplaintDetail() {
  const { complaintId } = useParams();
  const { user, isAdmin } = useAuth();
  const { complaints, support, saveComplaintPatch, note } = useData();
  const { showToast } = useToast();
  const [adminNote, setAdminNote] = useState("");
  const complaint = useMemo(() => complaints.find((item) => item.complaintId === complaintId), [complaintId, complaints]);

  if (!complaint) {
    return (
      <section className="section">
        <div className="card p-6">Complaint not found.</div>
      </section>
    );
  }

  async function handleSupport() {
    if (!user) {
      showToast("Sign in to support this issue.", "error");
      return;
    }
    const result = await support(complaint.complaintId, user.uid);
    showToast(result.alreadySupported ? "You already support this issue." : "Support recorded.");
  }

  async function handleAdminPatch(patch) {
    await saveComplaintPatch(complaint.complaintId, patch, user.uid);
    showToast("Complaint updated.");
  }

  async function saveNote() {
    if (!adminNote.trim()) return;
    await note(complaint.complaintId, user.uid, adminNote.trim());
    setAdminNote("");
    showToast("Admin note saved.");
  }

  return (
    <section className="section">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/complaints" className="text-sm font-bold text-civic">Back to complaints</Link>
          <h1 className="mt-2 text-3xl font-black tracking-tight">{complaint.aiSummary}</h1>
        </div>
        <button type="button" className="btn-primary" onClick={handleSupport}>
          <ThumbsUp size={17} />
          Support ({complaint.supportCount || 0})
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="space-y-5">
          <div className="card overflow-hidden">
            <div className="grid min-h-80 place-items-center bg-slate-100">
              {complaint.imageData ? <img src={complaint.imageData} alt="" className="max-h-[560px] w-full object-contain" /> : <span className="text-slate-500">No image in sample record</span>}
            </div>
            <div className="space-y-4 p-5">
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.aiPriority} />
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold">{complaint.aiCategory}</span>
              </div>
              <p className="leading-7 text-slate-700">{complaint.description}</p>
              <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <p><strong>Zone:</strong> {complaint.zoneName || "Unmapped"}</p>
                <p><strong>Department:</strong> {complaint.assignedDepartment || "Not assigned"}</p>
                <p><strong>Created:</strong> {formatDateTime(complaint.createdAt)}</p>
                <p><strong>Updated:</strong> {formatDateTime(complaint.updatedAt)}</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-4 text-xl font-black">Location preview</h2>
            <MapPanel complaints={[complaint]} regionId={complaint.regionId} height={360} />
          </div>
        </div>

        <aside className="space-y-5">
          <div className="card p-5">
            <h2 className="text-xl font-black">Status timeline</h2>
            <div className="mt-5">
              <Timeline items={complaint.timeline || []} />
            </div>
          </div>

          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-xl font-black"><MapPin size={20} /> GPS and zone</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p>Latitude: {complaint.latitude?.toFixed?.(6) || complaint.latitude}</p>
              <p>Longitude: {complaint.longitude?.toFixed?.(6) || complaint.longitude}</p>
              <p>Accuracy: {complaint.accuracy ? `${Math.round(complaint.accuracy)}m` : "Not available"}</p>
            </div>
          </div>

          {complaint.adminNotes && (
            <div className="card p-5">
              <h2 className="text-xl font-black">Admin note</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{complaint.adminNotes}</p>
            </div>
          )}

          {isAdmin && (
            <div className="card space-y-4 p-5">
              <h2 className="text-xl font-black">Admin actions</h2>
              <select className="field" value={complaint.status} onChange={(event) => handleAdminPatch({ status: event.target.value })}>
                {["Open", "Triaged", "In Progress", "Resolved", "Duplicate", "Rejected"].map((status) => <option key={status}>{status}</option>)}
              </select>
              <input className="field" value={complaint.assignedDepartment || ""} onChange={(event) => handleAdminPatch({ assignedDepartment: event.target.value })} placeholder="Assigned department" />
              <textarea className="field min-h-24" value={adminNote} onChange={(event) => setAdminNote(event.target.value)} placeholder="Internal note" />
              <button type="button" className="btn-secondary w-full" onClick={saveNote}>Save note</button>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
