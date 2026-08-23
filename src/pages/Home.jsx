import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CheckCircle2, Layers3, MapPinned, Radar, ShieldCheck, Sparkles, ThumbsUp } from "lucide-react";
import { useAuth } from "../state/AuthContext.jsx";
import { useData } from "../state/DataContext.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import ComplaintCard from "../components/complaints/ComplaintCard.jsx";

const features = [
  { icon: MapPinned, title: "GPS zone detection", text: "Raw coordinates are mapped to configurable regions and zones, with manual fallback when accuracy is weak." },
  { icon: Sparkles, title: "AI triage", text: "Complaints get category, priority, summary, tags, and likely department without replacing civic workflow logic." },
  { icon: Radar, title: "Duplicate control", text: "Nearby, similar, recent complaints are promoted for support instead of creating noisy duplicate records." },
  { icon: BarChart3, title: "Admin intelligence", text: "Moderators see hotspots, trends, priority breakdowns, assignments, notes, and resolution actions." },
];

export default function Home() {
  const { isAdmin } = useAuth();
  const { complaints, analytics } = useData();
  const latest = complaints.slice(0, 3);

  return (
    <>
      <section className="section grid min-h-[calc(100vh-4rem)] items-center gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-bold text-teal-800">
            <ShieldCheck size={16} />
            Scalable civic reporting for India, piloted on SATI Vidisha
          </div>
          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-ink sm:text-6xl lg:text-7xl">
            CrowdSense AI
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-650 text-slate-700">
            A real-time complaint intelligence system for campuses, cities, districts, and local authorities. Citizens report issues quickly; administrators receive mapped, deduplicated, prioritized work queues.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/report" className="btn-primary px-5 py-3">
              Report Issue <ArrowRight size={18} />
            </Link>
            <Link to="/complaints" className="btn-secondary px-5 py-3">
              View Live Complaints
            </Link>
            {isAdmin && (
              <Link to="/admin" className="btn-secondary px-5 py-3">
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="bg-ink p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-teal-100">Live pilot command view</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">SATI Vidisha</span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white/10 p-4">
                <p className="text-3xl font-black">{analytics.unresolved}</p>
                <p className="text-sm text-slate-200">Unresolved</p>
              </div>
              <div className="rounded-lg bg-white/10 p-4">
                <p className="text-3xl font-black">{analytics.resolved}</p>
                <p className="text-sm text-slate-200">Resolved</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 p-4">
            {latest.map((complaint) => (
              <ComplaintCard key={complaint.complaintId} complaint={complaint} compact />
            ))}
          </div>
        </div>
      </section>

      <section className="section grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total complaints" value={analytics.total} icon={Layers3} tone="teal" />
        <StatCard label="Open" value={analytics.open} icon={Radar} tone="blue" />
        <StatCard label="In progress" value={analytics.inProgress} icon={ThumbsUp} tone="amber" />
        <StatCard label="Resolved" value={analytics.resolved} icon={CheckCircle2} tone="teal" />
      </section>

      <section className="section">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-civic">Problem to workflow</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-ink">From scattered complaints to accountable resolution.</h2>
          </div>
          <p className="text-base leading-7 text-slate-700">
            People should not need to know which office owns a pothole, drain, light, or maintenance issue. CrowdSense AI captures the evidence, maps the zone, classifies the work, checks for duplicates, gathers public support, and gives authorities a single operational dashboard.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="card p-5">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-teal-50 text-civic">
                <feature.icon size={22} />
              </span>
              <h3 className="mt-4 text-lg font-black">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
