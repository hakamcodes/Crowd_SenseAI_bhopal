import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";
import { getZonesForRegion } from "../config/regions.js";
import { detectNearestZone } from "../utils/geo.js";

const gisCache = new Map();
const reverseGeocodeCache = new Map();

async function fetchGeoJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}`);
  return response.json();
}

export async function loadCityGis(region) {
  if (region.geoMode !== "polygon" || !region.gis) return null;
  if (gisCache.has(region.regionId)) return gisCache.get(region.regionId);

  const load = (async () => {
    const [wards, zones, cityBoundary, wardOffices, zoneOffices] = await Promise.all([
      fetchGeoJson(region.gis.wardsUrl),
      fetchGeoJson(region.gis.zonesUrl),
      fetchGeoJson(region.gis.cityBoundaryUrl),
      fetchGeoJson(region.gis.wardOfficesUrl),
      fetchGeoJson(region.gis.zoneOfficesUrl),
    ]);
    return { wards, zones, cityBoundary, wardOffices, zoneOffices };
  })();

  gisCache.set(region.regionId, load);
  return load;
}

function findContainingFeature(pt, featureCollection) {
  if (!featureCollection?.features?.length) return null;
  return featureCollection.features.find((feature) => {
    try {
      return booleanPointInPolygon(pt, feature);
    } catch {
      return false;
    }
  });
}

// Deterministic polygon containment only. This never guesses a ward/zone: if
// the point falls outside every polygon, the corresponding field is null.
export async function locateWard(location, region) {
  if (region.geoMode !== "polygon") return { ward: null, zone: null, withinCity: null };

  const gis = await loadCityGis(region);
  const pt = point([location.longitude, location.latitude]);

  const wardFeature = findContainingFeature(pt, gis.wards);
  const zoneFeature = findContainingFeature(pt, gis.zones);
  const withinCity = gis.cityBoundary ? Boolean(findContainingFeature(pt, gis.cityBoundary)) : null;

  const ward = wardFeature
    ? {
        number: wardFeature.properties.wardNumber,
        name: wardFeature.properties.wardName,
        lgdCode: wardFeature.properties.wardLgdCode,
        zoneNumber: wardFeature.properties.zoneNumber,
        corporator: wardFeature.properties.corporator,
        corporatorMobile: wardFeature.properties.corporatorMobile,
        wardOfficer: wardFeature.properties.wardOfficer,
        wardOfficerMobile: wardFeature.properties.wardOfficerMobile,
        population: wardFeature.properties.population,
      }
    : null;

  // Zone is resolved independently from the real zone-boundary polygons, not
  // from the ward's cross-referenced zone number, so it stays accurate even if
  // ward/zone numbering has drifted between source datasets.
  const zone = zoneFeature
    ? {
        number: zoneFeature.properties.zoneNumber,
        officerName: zoneFeature.properties.zoneOfficerName,
        officerMobile: zoneFeature.properties.zoneOfficerMobile,
      }
    : null;

  return { ward, zone, withinCity };
}

function extractAddress(nominatimResult) {
  if (!nominatimResult) return null;
  const address = nominatimResult.address || {};
  const locality =
    address.suburb || address.neighbourhood || address.village || address.town || address.city_district || "";
  return {
    road: address.road || "",
    locality,
    city: address.city || address.town || address.state_district || "",
    state: address.state || "",
    postcode: address.postcode || "",
    formattedAddress: nominatimResult.display_name || "",
  };
}

// OpenStreetMap Nominatim reverse geocoding. Free, no API key, subject to a
// ~1 req/sec fair-use rate limit — fine for a hackathon demo, cached per
// rounded coordinate, and never blocks complaint submission on failure.
export async function reverseGeocode(location) {
  const key = `${location.latitude.toFixed(5)},${location.longitude.toFixed(5)}`;
  if (reverseGeocodeCache.has(key)) return reverseGeocodeCache.get(key);

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.latitude}&lon=${location.longitude}&zoom=18&addressdetails=1`;
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Reverse geocoding request failed.");
    const data = await response.json();
    const address = extractAddress(data) || {
      road: "",
      locality: "",
      city: "",
      state: "",
      postcode: "",
      formattedAddress: "Address unavailable",
    };
    reverseGeocodeCache.set(key, address);
    return address;
  } catch (error) {
    console.warn("Reverse geocoding failed.", error);
    return { road: "", locality: "", city: "", state: "", postcode: "", formattedAddress: "Address unavailable" };
  }
}

export async function resolveLocationIntelligence(location, region) {
  if (region.geoMode === "circle") {
    const detected = detectNearestZone(location, getZonesForRegion(region.regionId));
    const address = await reverseGeocode(location);
    return {
      geoMode: "circle",
      zoneDetection: detected,
      ward: null,
      zone: null,
      withinCity: null,
      address,
    };
  }

  const [{ ward, zone, withinCity }, address] = await Promise.all([
    locateWard(location, region),
    reverseGeocode(location),
  ]);

  return { geoMode: "polygon", zoneDetection: null, ward, zone, withinCity, address };
}
