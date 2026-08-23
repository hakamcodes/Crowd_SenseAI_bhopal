import { AlertTriangle, CheckCircle2, Clock, Layers3 } from "lucide-react";
import AdminNav from "./AdminNav.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import BarList from "../../components/ui/BarList.jsx";
import ComplaintCard from "../../components/complaints/ComplaintCard.jsx";
import MapPanel from "../../components/map/MapPanel.jsx";
import { useData } from "../../state/DataContext.jsx";

export default function AdminDashboard() {
  const { complaints, analytics } = useData();
  const recent = complaints.slice(0, 4);

  return (
    <section className="section">
      <AdminNav />
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-civic">Moderator cockpit</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Admin dashboard</h1>
        <p className="mt-3 max-w-3xl text-slate-700">{analytics.adminSummary}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={analytics.total} icon={Layers3} tone="teal" />
        <StatCard label="Open" value={analytics.open} icon={AlertTriangle} tone="blue" />
        <StatCard label="In progress" value={analytics.inProgress} icon={Clock} tone="amber" />
        <StatCard label="Resolved" value={analytics.resolved} icon={CheckCircle2} tone="teal" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="card p-5">
          <h2 className="mb-4 text-xl font-black">Unresolved hotspots</h2>
          <MapPanel complaints={complaints.filter((item) => item.status !== "Resolved")} height={420} />
        </div>
        <div className="grid gap-5">
          <div className="card p-5">
            <h2 className="mb-4 text-xl font-black">Complaints by zone</h2>
            <BarList items={analytics.topProblemZones} />
          </div>
          <div className="card p-5">
            <h2 className="mb-4 text-xl font-black">Priority breakdown</h2>
            <BarList items={analytics.byPriority} />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-4 text-xl font-black">Recent activity</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {recent.map((complaint) => <ComplaintCard key={complaint.complaintId} complaint={complaint} compact />)}
        </div>
      </div>
    </section>
  );
}
