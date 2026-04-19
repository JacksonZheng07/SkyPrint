"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { SimulationResult } from "@/lib/types/comparison";
import { AltitudeChart } from "./trajectory/altitude-chart";
import { estimateCruiseAltitude } from "./trajectory/build-path";

function buildAltitudeProfiles(result: SimulationResult) {
  const { baseline, altitudeAdjustments } = result;
  const count = baseline.waypointResults.length;

  const baselineAlts = baseline.waypointResults.map((_, i) => {
    const adj = altitudeAdjustments.find((a) => a.waypointIndex === i);
    return adj?.originalAltitudeFt ?? estimateCruiseAltitude(i, count);
  });

  const optimizedAlts = baselineAlts.map((alt, i) => {
    const adj = altitudeAdjustments.find((a) => a.waypointIndex === i);
    return adj?.suggestedAltitudeFt ?? alt;
  });

  const maxAlt = Math.max(...baselineAlts, ...optimizedAlts, 40000);
  const minAlt = Math.min(
    ...baselineAlts.filter((a) => a > 0),
    ...optimizedAlts.filter((a) => a > 0),
    25000,
  );

  const riskZones = baseline.waypointResults.map((wp, i) => ({
    index: i,
    persistent: wp.persistent,
    sacSatisfied: wp.sacSatisfied,
  }));

  return { baselineAlts, optimizedAlts, riskZones, minAlt, maxAlt };
}

export function TrajectoryViewer({ result }: { result: SimulationResult }) {
  const chartData = useMemo(() => buildAltitudeProfiles(result), [result]);

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="mb-4 text-lg font-semibold">Altitude Profile</h3>
        <AltitudeChart {...chartData} />
        <ChartLegend />
      </CardContent>
    </Card>
  );
}

function ChartLegend() {
  return (
    <div className="mt-3 flex gap-6 text-sm">
      <LegendItem>
        <div className="h-0.5 w-5 border-t-2 border-dashed border-red-500" />
        Baseline
      </LegendItem>
      <LegendItem>
        <div className="h-0.5 w-5 bg-green-500" />
        Optimized
      </LegendItem>
      <LegendItem>
        <div className="h-3 w-3 rounded bg-red-500/10" />
        Contrail risk zone
      </LegendItem>
    </div>
  );
}

function LegendItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      {children}
    </div>
  );
}
