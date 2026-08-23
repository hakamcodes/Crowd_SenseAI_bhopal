const statusClass = {
  Open: "bg-blue-50 text-blue-800 border-blue-200",
  Triaged: "bg-amber-50 text-amber-800 border-amber-200",
  "In Progress": "bg-teal-50 text-teal-800 border-teal-200",
  Resolved: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Duplicate: "bg-slate-100 text-slate-700 border-slate-200",
  Rejected: "bg-red-50 text-red-800 border-red-200",
};

const priorityClass = {
  Low: "bg-slate-100 text-slate-700 border-slate-200",
  Medium: "bg-yellow-50 text-yellow-800 border-yellow-200",
  High: "bg-orange-50 text-orange-800 border-orange-200",
  Critical: "bg-red-50 text-red-800 border-red-200",
};

export function Badge({ children, className = "" }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${className}`}>{children}</span>;
}

export function StatusBadge({ status }) {
  return <Badge className={statusClass[status] || statusClass.Open}>{status || "Open"}</Badge>;
}

export function PriorityBadge({ priority }) {
  return <Badge className={priorityClass[priority] || priorityClass.Medium}>{priority || "Medium"}</Badge>;
}
