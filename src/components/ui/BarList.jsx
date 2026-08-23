export default function BarList({ items, max, empty = "No data yet" }) {
  const rows = Array.isArray(items) ? items : Object.entries(items || {});
  const top = max || Math.max(1, ...rows.map(([, value]) => value));

  if (!rows.length) return <p className="text-sm text-slate-500">{empty}</p>;

  return (
    <div className="space-y-3">
      {rows.map(([label, value]) => (
        <div key={label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-slate-700">{label}</span>
            <span className="text-slate-500">{value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-civic" style={{ width: `${Math.max(8, (value / top) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
