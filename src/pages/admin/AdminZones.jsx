import AdminNav from "./AdminNav.jsx";
import MapPanel from "../../components/map/MapPanel.jsx";
import { getRegion, getZonesForRegion } from "../../config/regions.js";
import { useData } from "../../state/DataContext.jsx";

export default function AdminZones() {
  const { complaints } = useData();
  const region = getRegion();
  const zones = getZonesForRegion(region.regionId);

  return (
    <section className="section">
      <AdminNav />
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-civic">Region configuration</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Admin zone management</h1>
        <p className="mt-3 max-w-3xl text-slate-700">
          SATI Vidisha is the default pilot region. Add future cities, campuses, wards, districts, and zones as records with center coordinates and radii.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="card p-5">
          <h2 className="text-xl font-black">{region.name}</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <p><strong>Type:</strong> {region.type}</p>
            <p><strong>District:</strong> {region.district}</p>
            <p><strong>Center:</strong> {region.defaultCenterLat}, {region.defaultCenterLng}</p>
            <p><strong>Default zoom:</strong> {region.zoomLevel}</p>
          </div>
          <div className="mt-5 space-y-3">
            {zones.map((zone) => (
              <div key={zone.zoneId} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black">{zone.name}</p>
                    <p className="text-sm text-slate-500">{zone.landmark}</p>
                  </div>
                  <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-bold text-civic">{zone.radiusMeters}m</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{zone.latitude}, {zone.longitude}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-3">
          <MapPanel complaints={complaints} regionId={region.regionId} height={620} />
        </div>
      </div>
    </section>
  );
}
