import { useMemo, useState } from "react";
import { AlertTriangle, Camera, CheckCircle2, LocateFixed, MapPin, Sparkles, ThumbsUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getRegion, getZonesForRegion, issueCategories } from "../config/regions.js";
import { classifyComplaint } from "../services/aiService.js";
import { findLikelyDuplicate } from "../services/duplicateService.js";
import { compressImageToBase64 } from "../utils/image.js";
import { detectNearestZone, getBrowserLocation } from "../utils/geo.js";
import { useAuth } from "../state/AuthContext.jsx";
import { useData } from "../state/DataContext.jsx";
import { useToast } from "../state/ToastContext.jsx";
import { PriorityBadge } from "../components/ui/Badge.jsx";

export default function ReportIssue() {
  const { user } = useAuth();
  const { complaints, submitComplaint, support } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const region = getRegion(user?.regionPreference);
  const regionZones = getZonesForRegion(region.regionId);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imageMeta, setImageMeta] = useState(null);
  const [location, setLocation] = useState(null);
  const [zoneState, setZoneState] = useState(null);
  const [manualZoneId, setManualZoneId] = useState("");
  const [ai, setAi] = useState(null);
  const [duplicate, setDuplicate] = useState(null);
  const [busy, setBusy] = useState(false);
  const selectedZone = useMemo(
    () => zoneState?.zone || regionZones.find((zone) => zone.zoneId === manualZoneId) || null,
    [manualZoneId, regionZones, zoneState],
  );

  async function handleImage(file) {
    try {
      const compressed = await compressImageToBase64(file);
      setImage(compressed.imageData);
      setImageMeta(compressed);
      showToast("Photo compressed for prototype Firestore storage.");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function captureLocation() {
    try {
      const gps = await getBrowserLocation();
      setLocation(gps);
      const detected = detectNearestZone(gps, regionZones);
      setZoneState(detected);
      setManualZoneId(detected.zone?.zoneId || "");
      showToast(detected.zone ? `Detected ${detected.zone.name}.` : "Location captured; choose a zone manually.");
    } catch (error) {
      showToast(error.message || "Location permission denied. Choose a zone manually.", "error");
      setZoneState({ zone: null, status: "manual" });
    }
  }

  async function analyze() {
    if (description.trim().length < 12) {
      showToast("Add a short description before AI triage.", "error");
      return null;
    }
    setBusy(true);
    try {
      const result = await classifyComplaint({
        description,
        imageData: image,
        zoneName: selectedZone?.name,
        regionName: region.name,
      });
      const normalized = {
        category: result.category || "Other",
        priority: result.priority || "Medium",
        summary: result.summary || description,
        confidence: Number(result.confidence || 0.5),
        suggestedDepartment: result.suggestedDepartment || "Campus Administration",
        tags: result.tags || [],
        source: result.source || "ai",
      };
      setAi(normalized);

      const candidate = {
        regionId: region.regionId,
        zoneId: selectedZone?.zoneId,
        latitude: location?.latitude || selectedZone?.latitude,
        longitude: location?.longitude || selectedZone?.longitude,
        description,
        aiCategory: normalized.category,
        createdAt: new Date().toISOString(),
      };
      setDuplicate(findLikelyDuplicate(candidate, complaints));
      return normalized;
    } finally {
      setBusy(false);
    }
  }

  async function createNewComplaint(event) {
    event.preventDefault();
    if (!image) {
      showToast("Upload a photo so the authority has evidence.", "error");
      return;
    }
    if (!selectedZone) {
      showToast("Capture location or choose a zone.", "error");
      return;
    }
    const classification = ai || (await analyze());
    if (!classification) return;
    if (duplicate) {
      showToast("A likely duplicate exists. Support it or confirm you need a separate report.", "error");
      return;
    }
    setBusy(true);
    try {
      const complaint = await submitComplaint({
        userId: user.uid,
        regionId: region.regionId,
        zoneId: selectedZone.zoneId,
        zoneName: selectedZone.name,
        latitude: location?.latitude || selectedZone.latitude,
        longitude: location?.longitude || selectedZone.longitude,
        accuracy: location?.accuracy || null,
        imageData: image,
        imageMimeType: imageMeta?.imageMimeType || "image/jpeg",
        imageSize: imageMeta?.imageSize || 0,
        description: description.trim(),
        aiCategory: classification.category,
        aiPriority: classification.priority,
        aiSummary: classification.summary,
        confidence: classification.confidence,
        tags: classification.tags,
        assignedDepartment: classification.suggestedDepartment,
        duplicateGroupId: "",
        isDuplicate: false,
        anonymous: false,
      });
      showToast("Complaint submitted.");
      navigate(`/complaints/${complaint.complaintId}`);
    } catch (error) {
      showToast(error.message || "Could not submit complaint.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function supportDuplicate() {
    if (!duplicate) return;
    const result = await support(duplicate.complaint.complaintId, user.uid);
    showToast(result.alreadySupported ? "You already support this issue." : "Support added to existing complaint.");
    navigate(`/complaints/${duplicate.complaint.complaintId}`);
  }

  return (
    <section className="section">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-civic">Report in under one minute</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Report a civic issue</h1>
      </div>

      <form className="grid gap-6 lg:grid-cols-[1fr_0.78fr]" onSubmit={createNewComplaint}>
        <div className="card space-y-5 p-5">
          <label className="block">
            <span className="mb-2 block text-sm font-bold">Issue photo</span>
            <div className="grid min-h-64 place-items-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-4">
              {image ? (
                <img src={image} alt="Selected complaint evidence" className="max-h-80 rounded-lg object-contain" />
              ) : (
                <div className="text-center text-slate-500">
                  <Camera className="mx-auto mb-2" />
                  Upload a clear photo. It will be compressed before saving.
                </div>
              )}
              <input className="mt-4 w-full text-sm" type="file" accept="image/*" onChange={(event) => handleImage(event.target.files?.[0])} />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold">Short description</span>
            <textarea
              className="field min-h-32"
              required
              maxLength={420}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Example: Streetlight near hostel walkway has been off for three nights."
            />
            <span className="mt-1 block text-xs text-slate-500">{description.length}/420 characters</span>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className="btn-secondary" onClick={captureLocation}>
              <LocateFixed size={17} />
              Capture GPS location
            </button>
            <button type="button" className="btn-secondary" onClick={analyze} disabled={busy}>
              <Sparkles size={17} />
              Run AI triage
            </button>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-bold">Detected or manual zone</span>
            <select className="field" value={manualZoneId} onChange={(event) => setManualZoneId(event.target.value)}>
              <option value="">Unmapped / Verify manually</option>
              {regionZones.map((zone) => <option key={zone.zoneId} value={zone.zoneId}>{zone.name}</option>)}
            </select>
          </label>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="text-lg font-black">Submission intelligence</h2>
            <div className="mt-4 space-y-3 text-sm">
              <p className="flex items-center gap-2"><MapPin size={16} /> Region: <strong>{region.name}</strong></p>
              <p>GPS: {location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)} (${Math.round(location.accuracy || 0)}m)` : "Not captured"}</p>
              <p>Zone: <strong>{selectedZone?.name || "Unmapped / Verify"}</strong></p>
              {zoneState?.status === "outside" && (
                <p className="rounded-md bg-amber-50 p-3 text-amber-900">Nearest configured zone is {zoneState.nearestZone?.name}, but GPS is outside its radius.</p>
              )}
            </div>
          </div>

          {ai && (
            <div className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-black">AI classification</h2>
                <PriorityBadge priority={ai.priority} />
              </div>
              <p className="mt-3 text-sm font-bold">{ai.category}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{ai.summary}</p>
              <p className="mt-3 text-xs font-semibold text-slate-500">Confidence: {Math.round(ai.confidence * 100)}% - {ai.source}</p>
              {ai.confidence < 0.65 && (
                <label className="mt-3 block">
                  <span className="mb-1 block text-sm font-bold">Adjust category</span>
                  <select className="field" value={ai.category} onChange={(event) => setAi({ ...ai, category: event.target.value })}>
                    {issueCategories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </label>
              )}
            </div>
          )}

          {duplicate && (
            <div className="card border-amber-200 bg-amber-50 p-5">
              <h2 className="flex items-center gap-2 text-lg font-black text-amber-950"><AlertTriangle size={19} /> Likely duplicate</h2>
              <p className="mt-2 text-sm leading-6 text-amber-900">A similar issue already exists. Supporting it will raise priority without cluttering the system.</p>
              <Link to={`/complaints/${duplicate.complaint.complaintId}`} className="mt-3 block rounded-md bg-white p-3 text-sm font-bold">
                {duplicate.complaint.aiSummary}
              </Link>
              <button type="button" className="btn-primary mt-3 w-full" onClick={supportDuplicate}>
                <ThumbsUp size={17} />
                Support existing complaint
              </button>
            </div>
          )}

          <button type="submit" className="btn-primary w-full py-3" disabled={busy}>
            <CheckCircle2 size={18} />
            {busy ? "Processing..." : "Submit new complaint"}
          </button>
        </aside>
      </form>
    </section>
  );
}
