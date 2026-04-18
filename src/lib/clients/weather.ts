import type { AtmosphericLayer, WeatherProfile } from "@/lib/types/weather";

const BASE_URL = "https://api.open-meteo.com/v1/gfs";

const PRESSURE_LEVELS = [150, 200, 250, 300, 350] as const;

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    [key: string]: string[] | number[];
  };
}

export async function getWeatherProfile(
  latitude: number,
  longitude: number,
  date: string
): Promise<WeatherProfile[]> {
  const pressureVars = PRESSURE_LEVELS.flatMap((p) => [
    `temperature_${p}hPa`,
    `relative_humidity_${p}hPa`,
    `windspeed_${p}hPa`,
    `winddirection_${p}hPa`,
  ]);

  const url = new URL(BASE_URL);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("hourly", pressureVars.join(","));
  url.searchParams.set("start_date", date);
  url.searchParams.set("end_date", date);
  url.searchParams.set("timezone", "UTC");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status}`);
  }

  const data: OpenMeteoResponse = await response.json();

  return data.hourly.time.map((time, i) => ({
    latitude: data.latitude,
    longitude: data.longitude,
    time,
    layers: PRESSURE_LEVELS.map(
      (p): AtmosphericLayer => ({
        pressureHpa: p,
        altitudeFt: pressureToAltitudeFt(p),
        temperatureC:
          (data.hourly[`temperature_${p}hPa`]?.[i] as number) ?? 0,
        relativeHumidity:
          (data.hourly[`relative_humidity_${p}hPa`]?.[i] as number) ?? 0,
        windSpeedKts:
          kmhToKnots(
            (data.hourly[`windspeed_${p}hPa`]?.[i] as number) ?? 0
          ),
        windDirection:
          (data.hourly[`winddirection_${p}hPa`]?.[i] as number) ?? 0,
      })
    ),
  }));
}

export async function getWeatherAlongRoute(
  waypoints: { latitude: number; longitude: number }[],
  date: string
): Promise<WeatherProfile[]> {
  // Sample waypoints to avoid too many API calls (max ~10 points)
  const sampled = sampleWaypoints(waypoints, 10);

  const profiles = await Promise.all(
    sampled.map((wp) => getWeatherProfile(wp.latitude, wp.longitude, date))
  );

  return profiles.flat();
}

function sampleWaypoints<T>(points: T[], maxCount: number): T[] {
  if (points.length <= maxCount) return points;

  const step = (points.length - 1) / (maxCount - 1);
  return Array.from({ length: maxCount }, (_, i) =>
    points[Math.round(i * step)]
  );
}

function pressureToAltitudeFt(pressureHpa: number): number {
  // Standard atmosphere approximation
  const altitudeM = 44330 * (1 - Math.pow(pressureHpa / 1013.25, 0.1903));
  return Math.round(altitudeM * 3.28084);
}

function kmhToKnots(kmh: number): number {
  return Math.round(kmh * 0.539957);
}
