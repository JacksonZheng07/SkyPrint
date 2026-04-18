"use client";

import { useRef, useEffect } from "react";
import * as Plot from "@observablehq/plot";
import type { FlightAnalysis } from "../lib/types";
import { FootnoteRef } from "./FootnoteRef";

interface LeaderboardChartProps {
  data: FlightAnalysis;
}

/**
 * Scene 5 (Branch A): Dot plot of avoidable warming per flight by carrier.
 * Only renders when flights_analyzed >= 30.
 */
export function LeaderboardChart({ data }: LeaderboardChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctx = data.airline_context;

  useEffect(() => {
    if (!containerRef.current) return;

    // SOURCE: flight_data.airline_context.leaderboard[*]
    const rows = ctx.leaderboard.map((entry) => ({
      carrier: entry.carrier,
      value: entry.avoidable_tco2e_per_flight.value,
      ci_low: entry.avoidable_tco2e_per_flight.ci_low,
      ci_high: entry.avoidable_tco2e_per_flight.ci_high,
      isHighlight: entry.carrier === ctx.carrier_name,
    }));

    const chart = Plot.plot({
      width: Math.min(containerRef.current.clientWidth, 520),
      height: Math.max(rows.length * 36, 140),
      marginLeft: 90,
      marginRight: 20,
      marginTop: 8,
      marginBottom: 30,
      x: {
        label: "Avoidable warming (tCO₂e / flight)",
        grid: true,
      },
      y: {
        label: null,
        domain: rows.sort((a, b) => a.value - b.value).map((r) => r.carrier),
      },
      marks: [
        // CI error bars (horizontal lines from ci_low to ci_high)
        Plot.link(rows, {
          x1: "ci_low",
          x2: "ci_high",
          y1: "carrier",
          y2: "carrier",
          stroke: "#555",
          strokeWidth: 1.5,
        }),
        // Dots
        Plot.dot(rows, {
          x: "value",
          y: "carrier",
          r: 6,
          fill: (d: (typeof rows)[number]) => (d.isHighlight ? "#F59E0B" : "#6B7280"),
          stroke: "#fff",
          strokeWidth: 1,
          tip: true,
          title: (d: (typeof rows)[number]) =>
            `${d.carrier}: ${d.value.toFixed(1)} tCO₂e/flight (${d.ci_low.toFixed(1)}–${d.ci_high.toFixed(1)})`,
        }),
        // Value labels
        Plot.text(rows, {
          x: "value",
          y: "carrier",
          text: (d: (typeof rows)[number]) => d.value.toFixed(1),
          dx: 14,
          fill: (d: (typeof rows)[number]) => (d.isHighlight ? "#F59E0B" : "#9CA3AF"),
          fontSize: 11,
          fontFamily: "var(--font-geist-mono)",
        }),
        Plot.ruleX([0]),
      ],
    });

    containerRef.current.replaceChildren(chart);

    return () => {
      chart.remove();
    };
  }, [ctx]);

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="[&_svg]:max-w-full" />
      <p className="text-xs text-zinc-500">
        {ctx.carrier_name} highlighted in amber. {ctx.flights_analyzed} flights
        analyzed across {ctx.total_carriers} carriers.
        <FootnoteRef
          field="airline_context.leaderboard"
          source="Pipeline aggregate ranking"
        />
      </p>
    </div>
  );
}
