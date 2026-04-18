import type { FlightAnalysis } from "./types";

/**
 * Load flight analysis JSON from /public/data/.
 * Returns null if the file is missing or malformed.
 */
export async function loadFlightData(
  flightId: string
): Promise<FlightAnalysis | null> {
  try {
    const res = await fetch(`/data/${flightId}.json`);
    if (!res.ok) return null;
    const data: FlightAnalysis = await res.json();
    if (!data.flight_id || !data.track_actual) return null;
    return data;
  } catch {
    console.error(
      `[data-loader] Pipeline output not found. Expected: /data/${flightId}.json`
    );
    return null;
  }
}

/**
 * Load ISSR GeoJSON overlay.
 */
export async function loadISSRGeoJSON(
  path: string
): Promise<GeoJSON.FeatureCollection | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    console.error(
      `[data-loader] ISSR GeoJSON not found. Expected: ${path}`
    );
    return null;
  }
}
