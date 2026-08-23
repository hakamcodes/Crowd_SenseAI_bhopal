import { useState } from "react";
import { resetPrototypeStore } from "../services/prototypeStore.js";
import { regions } from "../config/regions.js";
import { useAuth } from "../state/AuthContext.jsx";
import { useToast } from "../state/ToastContext.jsx";

export default function Settings() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [regionPreference, setRegionPreference] = useState(user.regionPreference);

  function reset() {
    resetPrototypeStore();
    showToast("Prototype data reset to SATI pilot seed records.");
  }

  return (
    <section className="section max-w-4xl">
      <h1 className="text-4xl font-black tracking-tight">Settings</h1>
      <div className="mt-6 grid gap-5">
        <div className="card p-5">
          <h2 className="text-xl font-black">Profile</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label>
              <span className="mb-1 block text-sm font-bold">Name</span>
              <input className="field" value={user.name} readOnly />
            </label>
            <label>
              <span className="mb-1 block text-sm font-bold">Role</span>
              <input className="field" value={user.role} readOnly />
            </label>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-xl font-black">Region preference</h2>
          <select className="field mt-4" value={regionPreference} onChange={(event) => setRegionPreference(event.target.value)}>
            {regions.map((region) => <option key={region.regionId} value={region.regionId}>{region.name}</option>)}
          </select>
          <p className="mt-3 text-sm text-slate-600">More regions can be added through config or Firestore records.</p>
        </div>
        <div className="card p-5">
          <h2 className="text-xl font-black">Prototype controls</h2>
          <p className="mt-2 text-sm text-slate-600">Local mode stores demo reports and compressed Base64 images in browser storage. Firestore mode uses your Firebase project.</p>
          <button type="button" className="btn-secondary mt-4" onClick={reset}>Reset pilot data</button>
        </div>
      </div>
    </section>
  );
}
