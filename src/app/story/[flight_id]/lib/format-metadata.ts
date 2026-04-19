import type { FlightAnalysis } from "./types";

export function formatFlightMetadata(m: FlightAnalysis["metadata"]) {
  const hours = Math.floor(m.duration_seconds / 3600);
  const mins = Math.round((m.duration_seconds % 3600) / 60);
  const dep = new Date(m.departure_utc);
  return {
    durationHours: (m.duration_seconds / 3600).toFixed(0),
    hours,
    mins,
    depFormatted: dep.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    depTime: dep.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }),
  };
}
