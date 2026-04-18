"use client";

import { useRef, useEffect } from "react";
import * as Plot from "@observablehq/plot";
import type { FlightAnalysis } from "../lib/types";
import { FootnoteRef } from "./FootnoteRef";
import { toCarsPerYear } from "../lib/conversions";

interface ReceiptChartProps {
  data: FlightAnalysis;
}

/**
 * Scene 3: Stacked horizontal bar showing warming breakdown.
 * Every number traces to a pipeline JSON field.
 */
export function ReceiptChart({ data }: ReceiptChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const t = data.totals.actual;

  // SOURCE: flight_data.totals.actual.*
  const co2 = t.co2_fuel_kg.value;
  const contrail = t.contrail_forcing_tco2e.value;
  const nonCo2 = t.non_co2_other_tco2e.value;
  const total = t.total_warming_tco2e.value;

  useEffect(() => {
    if (!containerRef.current) return;

    const bars = [
      { category: "CO₂ from fuel", value: co2, fill: "#3B82F6", order: 0 },
      { category: "Contrail warming", value: contrail, fill: "#EF4444", order: 1 },
      { category: "Other non-CO₂", value: nonCo2, fill: "#F97316", order: 2 },
    ];

    const chart = Plot.plot({
      width: Math.min(containerRef.current.clientWidth, 520),
      height: 180,
      marginLeft: 10,
      marginRight: 10,
      marginTop: 12,
      marginBottom: 30,
      x: { label: "tCO₂e", domain: [0, total * 1.15] },
      y: { label: null, domain: ["This flight", "Booking site"], padding: 0.4 },
      color: { legend: false },
      marks: [
        // Stacked bar for the real impact
        Plot.barX(bars, {
          x: "value",
          y: () => "This flight",
          fill: "fill",
          sort: { y: null },
          order: "order",
          tip: true,
          title: (d: (typeof bars)[number]) => `${d.category}: ${d.value.toFixed(1)} tCO₂e`,
        }),
        // What the airline reports (CO₂ only)
        Plot.barX([{ value: co2, fill: "#3B82F6" }], {
          x: "value",
          y: () => "Booking site",
          fill: "fill",
          tip: true,
          title: () => `CO₂ only: ${co2.toFixed(1)} tCO₂e`,
        }),
        // CI error bar on total
        Plot.link(
          [{ low: t.total_warming_tco2e.ci_low, high: t.total_warming_tco2e.ci_high }],
          {
            x1: "low",
            x2: "high",
            y1: () => "This flight",
            y2: () => "This flight",
            stroke: "#fff",
            strokeWidth: 1.5,
          }
        ),
        // Total label
        Plot.text([{ x: total, label: `${total.toFixed(1)}` }], {
          x: "x",
          y: () => "This flight",
          text: "label",
          dx: 25,
          fill: "#fff",
          fontSize: 12,
          fontWeight: "600",
          fontFamily: "var(--font-geist-mono)",
        }),
        Plot.ruleX([0]),
      ],
    });

    containerRef.current.replaceChildren(chart);

    return () => {
      chart.remove();
    };
  }, [co2, contrail, nonCo2, total, t.total_warming_tco2e.ci_low, t.total_warming_tco2e.ci_high]);

  return (
    <div className="space-y-3">
      <div ref={containerRef} className="[&_svg]:max-w-full" />
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#3B82F6]" />
          CO₂ from fuel: {co2.toFixed(1)} tCO₂e
          <FootnoteRef
            field="totals.actual.co2_fuel_kg"
            source={t.co2_fuel_kg.source}
          />
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#EF4444]" />
          Contrail: {contrail.toFixed(1)} tCO₂e
          <FootnoteRef
            field="totals.actual.contrail_forcing_tco2e"
            source={t.contrail_forcing_tco2e.source}
          />
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#F97316]" />
          Other non-CO₂: {nonCo2.toFixed(1)} tCO₂e
          <FootnoteRef
            field="totals.actual.non_co2_other_tco2e"
            source={t.non_co2_other_tco2e.source}
          />
        </span>
      </div>
    </div>
  );
}
