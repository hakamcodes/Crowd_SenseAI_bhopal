export default function StatCard({ label, value, icon: Icon, tone = "teal" }) {
  const colors = {
    teal: "bg-teal-50 text-teal-800",
    blue: "bg-blue-50 text-blue-800",
    amber: "bg-amber-50 text-amber-800",
    rose: "bg-rose-50 text-rose-800",
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-ink">{value}</p>
        </div>
        {Icon && (
          <span className={`grid h-11 w-11 place-items-center rounded-lg ${colors[tone] || colors.teal}`}>
            <Icon size={21} />
          </span>
        )}
      </div>
    </div>
  );
}
