"use client";

import type { SceneName } from "../hooks/useScrollama";
import type { FlightAnalysis, TrackPoint } from "../lib/types";
import { FootnoteRef } from "./FootnoteRef";
import { toCarsPerYear } from "../lib/conversions";

interface SceneTextProps {
  scene: SceneName;
  data: FlightAnalysis;
}

/**
 * Renders the text overlay for each scene.
 * Text is sparse by design — maximum 2 sentences visible per scene.
 */
export function SceneText({ scene, data }: SceneTextProps) {
  const m = data.metadata;
  const durationH = (m.duration_seconds / 3600).toFixed(0);
  const durationMin = Math.round(m.duration_seconds / 60);
  const hours = Math.floor(m.duration_seconds / 3600);
  const mins = Math.round((m.duration_seconds % 3600) / 60);
  const depDate = new Date(m.departure_utc);
  const depFormatted = depDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const depTime = depDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });

  if (scene === "flight") {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          {/* SOURCE: flight_data.metadata.iata, origin, destination */}
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            {m.iata} · {m.origin} → {m.destination}
          </h1>
          {/* SOURCE: flight_data.metadata.aircraft_type, departure_utc */}
          <p className="text-sm text-zinc-400">
            {m.aircraft_type} · {depFormatted}, {depTime} UTC
          </p>
          {/* SOURCE: flight_data.metadata.duration_seconds */}
          <p className="text-sm text-zinc-400">
            {hours} hours {mins} minutes
          </p>
        </div>
        <p className="text-sm text-zinc-300 max-w-md leading-relaxed">
          This is a real flight. Flights produce CO₂ — but they also produce
          contrails, and contrails warm the planet about as much as the fuel
          burn itself. Most people, and every booking site, miss this.
        </p>
      </div>
    );
  }

  if (scene === "issr") {
    // Compute minutes in ISSR from data — one of the few allowed frontend computations
    const issrMinutes = computeISSRMinutes(data.track_actual);
    return (
      <div className="space-y-4 max-w-md">
        <p className="text-sm sm:text-base text-zinc-200 leading-relaxed">
          For {issrMinutes} minutes of this {durationH}-hour flight, the
          aircraft flew through air cold and humid enough that its exhaust
          turned into persistent warming clouds.
        </p>
        <p className="text-xs text-zinc-400 leading-relaxed">
          The colored regions show where conditions were right for contrail
          formation. Red segments: the aircraft was inside them.
          <FootnoteRef
            field="metadata.data_sources.weather"
            source={m.data_sources.weather?.source ?? "ERA5"}
            url="https://cds.climate.copernicus.eu/"
          />
        </p>
      </div>
    );
  }

  if (scene === "receipt") {
    // SOURCE: flight_data.totals.actual.total_warming_tco2e.value
    const total = data.totals.actual.total_warming_tco2e.value;
    const co2Only = data.totals.actual.co2_fuel_kg.value;
    const multiplier = (total / co2Only).toFixed(1);
    const cars = Math.round(toCarsPerYear(total));

    return (
      <div className="space-y-3 max-w-lg">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">
          The real warming impact
        </h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          {/* SOURCE: flight_data.totals.actual.total_warming_tco2e / co2_fuel_kg */}
          This flight&apos;s actual warming impact is{" "}
          <span className="text-white font-semibold font-mono">
            {multiplier}x
          </span>{" "}
          what {data.airline_context.carrier_name}&apos;s booking site told
          passengers.
          <FootnoteRef
            field="totals.actual.total_warming_tco2e"
            source={data.totals.actual.total_warming_tco2e.source}
          />
        </p>
        {/* SOURCE: EPA conversion, see conversions.ts */}
        <p className="text-xs text-zinc-400">
          Equivalent to {cars} cars driven for a year.
          <FootnoteRef
            field="EPA_car_equivalence"
            source="EPA Greenhouse Gas Equivalencies Calculator (4.6 tCO2/car/year)"
            url="https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator"
          />
        </p>
      </div>
    );
  }

  if (scene === "counterfactual") {
    // SOURCE: flight_data.counterfactual_spec.selected_offset_ft_by_segment
    const offsets = data.counterfactual_spec.selected_offset_ft_by_segment;
    const nonZero = offsets.filter((o) => o !== 0);
    const dominantOffset =
      nonZero.length > 0
        ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length
        : 0;
    const offsetLabel = Math.round(dominantOffset);
    const avoidable = data.totals.avoidable_warming_tco2e.value;
    const fuelPenalty = data.totals.fuel_penalty_kg;
    const fuelPct = data.totals.fuel_penalty_pct;
    const carsAvoided = Math.round(toCarsPerYear(avoidable));
    const nOffsets = data.counterfactual_spec.offsets_evaluated_ft.length;

    return (
      <div className="space-y-4 max-w-lg">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">
          The route not taken
        </h2>
        {/* SOURCE: flight_data.counterfactual_spec.selected_offset_ft_by_segment,
            CITATION: flight_data.totals.avoidable_warming_tco2e, fuel_penalty_kg */}
        <p className="text-sm text-zinc-300 leading-relaxed">
          A{" "}
          <span className="font-mono text-[#00E5CC]">{offsetLabel} ft</span>{" "}
          altitude change over the North Atlantic would have cost{" "}
          <span className="font-mono">{fuelPenalty.toFixed(1)} kg</span> of
          extra fuel — {fuelPct.toFixed(1)}% more — and avoided{" "}
          <span className="font-mono text-white font-semibold">
            {avoidable.toFixed(1)} tCO₂e
          </span>{" "}
          of warming. That&apos;s equivalent to {carsAvoided} cars off the
          road for a year. The aircraft didn&apos;t make that change.
          <FootnoteRef
            field="totals.avoidable_warming_tco2e"
            source={data.totals.avoidable_warming_tco2e.source}
          />
        </p>
        <p className="text-xs text-zinc-500">
          The optimized route was computed under a{" "}
          {data.counterfactual_spec.fuel_constraint} across {nOffsets} altitude
          offsets evaluated.
          <FootnoteRef
            field="counterfactual_spec.method"
            source={data.counterfactual_spec.method}
          />
        </p>
      </div>
    );
  }

  if (scene === "context") {
    const ctx = data.airline_context;
    if (ctx.flights_analyzed < 30) {
      return (
        <div className="space-y-4 max-w-lg">
          <h2 className="text-xl font-semibold text-white">
            How we would rank airlines at scale
          </h2>
          <p className="text-sm text-zinc-300">
            Our prototype covers {ctx.flights_analyzed} flights across{" "}
            {ctx.total_carriers} carriers. Statistical ranking requires n ≥ 30
            per carrier. The methodology is validated on the flight above; the
            scaled version requires longer retrospective windows.
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-3 max-w-lg">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">
          Airline context
        </h2>
        {/* SOURCE: flight_data.airline_context.rank, total_carriers */}
        <p className="text-sm text-zinc-300 leading-relaxed">
          {ctx.carrier_name} ranks{" "}
          <span className="font-mono text-white font-semibold">
            {ctx.rank}
          </span>{" "}
          of {ctx.total_carriers} airlines on avoidable contrail warming.
          <FootnoteRef
            field="airline_context.rank"
            source="Pipeline aggregate ranking"
          />
        </p>
        <p className="text-xs text-zinc-500">
          This metric, scaled industry-wide, becomes an accountability
          framework for regulators and airline procurement teams. Our prototype
          covers {ctx.flights_analyzed} flights on the North Atlantic.
        </p>
      </div>
    );
  }

  return null;
}

/**
 * Compute minutes spent in ISSR from consecutive track points where in_issr === true.
 * This is one of the allowed frontend computations — documented per spec.
 */
function computeISSRMinutes(track: TrackPoint[]): number {
  let totalMs = 0;
  for (let i = 1; i < track.length; i++) {
    if (track[i].in_issr && track[i - 1].in_issr) {
      const t1 = new Date(track[i - 1].t).getTime();
      const t2 = new Date(track[i].t).getTime();
      totalMs += Math.abs(t2 - t1);
    }
  }
  return Math.round(totalMs / 60000);
}
