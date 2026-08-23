import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import ComplaintCard from "../components/complaints/ComplaintCard.jsx";
import { complaintStatuses, issueCategories } from "../config/regions.js";
import { useData } from "../state/DataContext.jsx";

export default function ComplaintFeed() {
  const { complaints, loading } = useData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return complaints
      .filter((item) => !status || item.status === status)
      .filter((item) => !category || item.aiCategory === category)
      .filter((item) => !needle || `${item.description} ${item.aiSummary} ${item.zoneName}`.toLowerCase().includes(needle));
  }, [category, complaints, query, status]);

  return (
    <section className="section">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-civic">Public feed</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Live complaints</h1>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:w-[700px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 text-slate-400" size={17} />
            <input className="field pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search issues" />
          </label>
          <select className="field" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {complaintStatuses.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className="field" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {issueCategories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card p-6">Loading complaints...</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((complaint) => <ComplaintCard key={complaint.complaintId} complaint={complaint} />)}
        </div>
      )}
    </section>
  );
}
