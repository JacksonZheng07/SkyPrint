import type { Waypoint } from "@/lib/types/flight";

const EARTH_RADIUS_KM = 6371;

export function greatCircleDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function interpolateGreatCircle(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
  numPoints: number,
  cruiseAltitudeFt: number = 35000,
  departureTime: string
): Waypoint[] {
  const lat1 = toRadians(origin.latitude);
  const lon1 = toRadians(origin.longitude);
  const lat2 = toRadians(destination.latitude);
  const lon2 = toRadians(destination.longitude);

  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2
      )
    );

  const distanceKm = greatCircleDistanceKm(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude
  );
  // Approximate flight time at ~900 km/h
  const totalMinutes = (distanceKm / 900) * 60;
  const depTime = new Date(departureTime).getTime();

  return Array.from({ length: numPoints }, (_, i) => {
    const f = i / (numPoints - 1);
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);

    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);

    const lat = Math.atan2(z, Math.sqrt(x ** 2 + y ** 2));
    const lon = Math.atan2(y, x);

    // Altitude profile: climb, cruise, descent
    let altitudeFt: number;
    if (f < 0.1) {
      altitudeFt = cruiseAltitudeFt * (f / 0.1);
    } else if (f > 0.9) {
      altitudeFt = cruiseAltitudeFt * ((1 - f) / 0.1);
    } else {
      altitudeFt = cruiseAltitudeFt;
    }

    return {
      latitude: toDegrees(lat),
      longitude: toDegrees(lon),
      altitudeFt: Math.round(altitudeFt),
      time: new Date(depTime + f * totalMinutes * 60000).toISOString(),
    };
  });
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}
