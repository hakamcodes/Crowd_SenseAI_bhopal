import { useState } from "react";
import MapPanel from "../components/map/MapPanel.jsx";
import { complaintStatuses, issueCategories } from "../config/regions.js";
import { useData } from "../state/DataContext.jsx";

export default function MapPage() {
  const { complaints } = useData();
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");

  return (
    <section className="section">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-civic">Live map</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Mapped complaints and zones</h1>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:w-[460px]">
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
      <div className="card p-3">
        <MapPanel complaints={complaints} height={640} filters={{ status, category }} />
      </div>
    </section>
  );
}
