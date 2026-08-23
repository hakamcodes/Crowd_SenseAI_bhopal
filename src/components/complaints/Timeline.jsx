import { formatDateTime } from "../../utils/date.js";

export default function Timeline({ items = [] }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`${item.label}-${item.at}-${index}`} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="h-3 w-3 rounded-full bg-civic" />
            {index < items.length - 1 && <span className="h-full w-px bg-slate-200" />}
          </div>
          <div className="pb-4">
            <p className="text-sm font-bold text-ink">{item.label}</p>
            <p className="text-xs text-slate-500">{formatDateTime(item.at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
