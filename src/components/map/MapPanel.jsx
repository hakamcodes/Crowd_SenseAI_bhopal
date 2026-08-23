import { useEffect, useRef } from "react";
import L from "leaflet";
import { getRegion, getZonesForRegion } from "../../config/regions.js";

const statusColors = {
  Open: "#2563eb",
  Triaged: "#d97706",
  "In Progress": "#0f766e",
  Resolved: "#059669",
  Duplicate: "#64748b",
  Rejected: "#dc2626",
};

function makeIcon(color) {
  return L.divIcon({
    className: "",
    html: `<span class="marker-dot" style="background:${color}"></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export default function MapPanel({ complaints = [], regionId = "sati-vidisha", height = 520, filters = {} }) {
  const nodeRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const region = getRegion(regionId);
  const regionZones = getZonesForRegion(regionId);

  useEffect(() => {
    if (!nodeRef.current || mapRef.current) return;
    mapRef.current = L.map(nodeRef.current, { scrollWheelZoom: true }).setView(
      [region.defaultCenterLat, region.defaultCenterLng],
      region.zoomLevel,
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);
  }, [region.defaultCenterLat, region.defaultCenterLng, region.zoomLevel]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((layer) => layer.remove());
    markersRef.current = [];

    regionZones.forEach((zone) => {
      const circle = L.circle([zone.latitude, zone.longitude], {
        radius: zone.radiusMeters,
        color: "#0f766e",
        fillColor: "#0f766e",
        fillOpacity: 0.08,
        weight: 1,
      }).addTo(map);
      circle.bindPopup(`<strong>${zone.name}</strong><br>${zone.landmark || zone.type}`);
      markersRef.current.push(circle);
    });

    complaints
      .filter((item) => !filters.status || item.status === filters.status)
      .filter((item) => !filters.category || item.aiCategory === filters.category)
      .filter((item) => item.latitude && item.longitude)
      .forEach((complaint) => {
        const marker = L.marker([complaint.latitude, complaint.longitude], {
          icon: makeIcon(statusColors[complaint.status] || "#2563eb"),
        }).addTo(map);
        marker.bindPopup(`
          <strong>${complaint.aiCategory}</strong><br>
          ${complaint.zoneName || "Unmapped"}<br>
          ${complaint.status} - ${complaint.supportCount || 0} supporters
        `);
        markersRef.current.push(marker);
      });

    window.setTimeout(() => map.invalidateSize(), 150);
  }, [complaints, filters.category, filters.status, regionZones]);

  return <div ref={nodeRef} className="z-0 w-full overflow-hidden rounded-lg border border-slate-200" style={{ height }} />;
}
