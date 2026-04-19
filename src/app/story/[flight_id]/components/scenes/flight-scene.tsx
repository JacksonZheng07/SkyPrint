import type { FlightAnalysis } from "../../lib/types";
import { formatFlightMetadata } from "../../lib/format-metadata";

export function FlightScene({ data }: { data: FlightAnalysis }) {
  const m = data.metadata;
  const { hours, mins, depFormatted, depTime } = formatFlightMetadata(m);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
          {m.iata} · {m.origin} → {m.destination}
        </h1>
        <p className="text-sm text-zinc-400">
          {m.aircraft_type} · {depFormatted}, {depTime} UTC
        </p>
        <p className="text-sm text-zinc-400">
          {hours} hours {mins} minutes
        </p>
      </div>
      <p className="text-sm text-zinc-300 max-w-md leading-relaxed">
        This is a real flight. Flights produce CO₂ — but they also produce contrails, and contrails
        warm the planet about as much as the fuel burn itself. Most people, and every booking site,
        miss this.
      </p>
    </div>
  );
}
