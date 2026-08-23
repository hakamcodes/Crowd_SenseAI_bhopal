import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { addAdminNote, createComplaint, listComplaints, supportComplaint, updateComplaint } from "../services/complaintRepository.js";
import { buildAnalytics } from "../services/analyticsService.js";
import { regions, zones } from "../config/regions.js";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setComplaints(await listComplaints());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const listener = () => refresh();
    window.addEventListener("crowdsense-store-updated", listener);
    return () => window.removeEventListener("crowdsense-store-updated", listener);
  }, [refresh]);

  const submitComplaint = useCallback(async (payload) => {
    const complaint = await createComplaint(payload);
    await refresh();
    return complaint;
  }, [refresh]);

  const saveComplaintPatch = useCallback(async (complaintId, patch, actorId) => {
    await updateComplaint(complaintId, patch, actorId);
    await refresh();
  }, [refresh]);

  const support = useCallback(async (complaintId, userId) => {
    const result = await supportComplaint(complaintId, userId);
    await refresh();
    return result;
  }, [refresh]);

  const note = useCallback(async (complaintId, adminId, text) => {
    await addAdminNote(complaintId, adminId, text);
    await refresh();
  }, [refresh]);

  const analytics = useMemo(() => buildAnalytics(complaints), [complaints]);

  const value = useMemo(
    () => ({
      complaints,
      regions,
      zones,
      analytics,
      loading,
      refresh,
      submitComplaint,
      saveComplaintPatch,
      support,
      note,
    }),
    [analytics, complaints, loading, note, refresh, saveComplaintPatch, submitComplaint, support],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used inside DataProvider");
  return context;
}
