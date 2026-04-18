import type { Waypoint } from "@/lib/types/flight";

const BASE_URL = "https://opensky-network.org/api";

interface OpenSkyStateVector {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  time_position: number;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null; // meters
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  geo_altitude: number | null;
}

interface OpenSkyTrack {
  icao24: string;
  startTime: number;
  endTime: number;
  callesign: string;
  path: [
    number, // time
    number, // latitude
    number, // longitude
    number, // baro_altitude (m)
    number, // true_track
    boolean, // on_ground
  ][];
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const clientId = process.env.OPENSKY_CLIENT_ID;
  const clientSecret = process.env.OPENSKY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return {};
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );
  return { Authorization: `Basic ${credentials}` };
}

export async function getAircraftTrack(
  icao24: string,
  time?: number
): Promise<Waypoint[]> {
  const headers = await getAuthHeaders();
  const url = new URL(`${BASE_URL}/tracks/all`);
  url.searchParams.set("icao24", icao24);
  if (time) url.searchParams.set("time", String(time));

  const response = await fetch(url.toString(), { headers });
  if (!response.ok) {
    throw new Error(`OpenSky API error: ${response.status}`);
  }

  const data: OpenSkyTrack = await response.json();

  return data.path
    .filter(([, lat, lon, alt]) => lat && lon && alt)
    .map(([timestamp, latitude, longitude, altitudeM]) => ({
      latitude,
      longitude,
      altitudeFt: metersToFeet(altitudeM),
      time: new Date(timestamp * 1000).toISOString(),
    }));
}

export async function getCurrentStates(
  bounds?: { lamin: number; lamax: number; lomin: number; lomax: number }
): Promise<OpenSkyStateVector[]> {
  const headers = await getAuthHeaders();
  const url = new URL(`${BASE_URL}/states/all`);

  if (bounds) {
    url.searchParams.set("lamin", String(bounds.lamin));
    url.searchParams.set("lamax", String(bounds.lamax));
    url.searchParams.set("lomin", String(bounds.lomin));
    url.searchParams.set("lomax", String(bounds.lomax));
  }

  const response = await fetch(url.toString(), { headers });
  if (!response.ok) {
    throw new Error(`OpenSky API error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.states) return [];

  return data.states.map(
    (s: (string | number | boolean | null)[]): OpenSkyStateVector => ({
      icao24: s[0] as string,
      callsign: (s[1] as string)?.trim() ?? null,
      origin_country: s[2] as string,
      time_position: s[3] as number,
      longitude: s[5] as number | null,
      latitude: s[6] as number | null,
      baro_altitude: s[7] as number | null,
      velocity: s[9] as number | null,
      true_track: s[10] as number | null,
      vertical_rate: s[11] as number | null,
      geo_altitude: s[13] as number | null,
    })
  );
}

function metersToFeet(meters: number): number {
  return Math.round(meters * 3.28084);
}
