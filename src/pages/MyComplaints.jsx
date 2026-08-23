import ComplaintCard from "../components/complaints/ComplaintCard.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import { useData } from "../state/DataContext.jsx";

export default function MyComplaints() {
  const { user } = useAuth();
  const { complaints } = useData();
  const mine = complaints.filter((item) => item.userId === user.uid);

  return (
    <section className="section">
      <h1 className="text-4xl font-black tracking-tight">My complaints</h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {mine.map((complaint) => <ComplaintCard key={complaint.complaintId} complaint={complaint} />)}
        {!mine.length && <div className="card p-6">No complaints submitted from this account yet.</div>}
      </div>
    </section>
  );
}
