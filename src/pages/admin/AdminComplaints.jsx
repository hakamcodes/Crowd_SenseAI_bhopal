import { Link } from "react-router-dom";
import AdminNav from "./AdminNav.jsx";
import { complaintStatuses, departments, issueCategories } from "../../config/regions.js";
import { PriorityBadge, StatusBadge } from "../../components/ui/Badge.jsx";
import { timeAgo } from "../../utils/date.js";
import { useAuth } from "../../state/AuthContext.jsx";
import { useData } from "../../state/DataContext.jsx";
import { useToast } from "../../state/ToastContext.jsx";

export default function AdminComplaints() {
  const { user } = useAuth();
  const { complaints, saveComplaintPatch } = useData();
  const { showToast } = useToast();

  async function patch(id, payload) {
    await saveComplaintPatch(id, payload, user.uid);
    showToast("Complaint updated.");
  }

  return (
    <section className="section">
      <AdminNav />
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-civic">Operations</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Admin complaints table</h1>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1050px] w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Issue</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Support</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.map((complaint) => (
                <tr key={complaint.complaintId} className="align-top hover:bg-slate-50">
                  <td className="max-w-xs px-4 py-4">
                    <Link to={`/complaints/${complaint.complaintId}`} className="font-black text-ink hover:text-civic">
                      {complaint.aiSummary}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-slate-500">{complaint.description}</p>
                  </td>
                  <td className="px-4 py-4">
                    <select className="field min-w-36" value={complaint.status} onChange={(event) => patch(complaint.complaintId, { status: event.target.value })}>
                      {complaintStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                    <div className="mt-2"><StatusBadge status={complaint.status} /></div>
                  </td>
                  <td className="px-4 py-4"><PriorityBadge priority={complaint.aiPriority} /></td>
                  <td className="px-4 py-4">
                    <select className="field min-w-44" value={complaint.aiCategory} onChange={(event) => patch(complaint.complaintId, { aiCategory: event.target.value })}>
                      {issueCategories.map((category) => <option key={category}>{category}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-4 font-semibold">{complaint.zoneName}</td>
                  <td className="px-4 py-4">
                    <select className="field min-w-52" value={complaint.assignedDepartment || ""} onChange={(event) => patch(complaint.complaintId, { assignedDepartment: event.target.value })}>
                      <option value="">Unassigned</option>
                      {departments.map((department) => <option key={department}>{department}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-4 font-bold">{complaint.supportCount || 0}</td>
                  <td className="px-4 py-4 text-slate-500">{timeAgo(complaint.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
