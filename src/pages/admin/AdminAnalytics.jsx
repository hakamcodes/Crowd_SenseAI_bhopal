import AdminNav from "./AdminNav.jsx";
import BarList from "../../components/ui/BarList.jsx";
import { useData } from "../../state/DataContext.jsx";

export default function AdminAnalytics() {
  const { analytics } = useData();

  return (
    <section className="section">
      <AdminNav />
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-civic">AI-assisted insight</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Analytics summary</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card p-5">
          <h2 className="text-xl font-black">Admin summary</h2>
          <p className="mt-3 leading-7 text-slate-700">{analytics.adminSummary}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-2xl font-black">{analytics.unresolved}</p>
              <p className="text-sm text-slate-500">Unresolved</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-2xl font-black">{analytics.duplicateClusters}</p>
              <p className="text-sm text-slate-500">Duplicate clusters</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="card p-5">
            <h2 className="mb-4 text-xl font-black">Top zones</h2>
            <BarList items={analytics.topProblemZones} />
          </div>
          <div className="card p-5">
            <h2 className="mb-4 text-xl font-black">Top categories</h2>
            <BarList items={analytics.topCategories} />
          </div>
          <div className="card p-5">
            <h2 className="mb-4 text-xl font-black">Status trend</h2>
            <BarList items={analytics.byStatus} />
          </div>
          <div className="card p-5">
            <h2 className="mb-4 text-xl font-black">Priority mix</h2>
            <BarList items={analytics.byPriority} />
          </div>
        </div>
      </div>
    </section>
  );
}
