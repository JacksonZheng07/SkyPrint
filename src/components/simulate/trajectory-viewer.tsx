"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { SimulationResult } from "@/lib/types/comparison";

interface TrajectoryViewerProps {
  result: SimulationResult;
}

export function TrajectoryViewer({ result }: TrajectoryViewerProps) {
  const { baseline, optimized, altitudeAdjustments } = result;

  const baselineAlts = baseline.waypointResults.map((_, i) => {
    // Reconstruct altitude profile from adjustments or use even spacing
    const adjustment = altitudeAdjustments.find((a) => a.waypointIndex === i);
    return adjustment?.originalAltitudeFt ?? estimateAltitude(i, baseline.waypointResults.length);
  });

  const optimizedAlts = baseline.waypointResults.map((_, i) => {
    const adjustment = altitudeAdjustments.find((a) => a.waypointIndex === i);
    return adjustment?.suggestedAltitudeFt ?? baselineAlts[i];
  });

  const maxAlt = Math.max(...baselineAlts, ...optimizedAlts, 40000);
  const minAlt = Math.min(...baselineAlts.filter((a) => a > 0), ...optimizedAlts.filter((a) => a > 0), 25000);

  const chartHeight = 200;
  const chartWidth = 600;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const plotW = chartWidth - padding.left - padding.right;
  const plotH = chartHeight - padding.top - padding.bottom;

  const baselinePath = useMemo(
    () => buildPath(baselineAlts, plotW, plotH, minAlt, maxAlt),
    [baselineAlts, plotW, plotH, minAlt, maxAlt]
  );

  const optimizedPath = useMemo(
    () => buildPath(optimizedAlts, plotW, plotH, minAlt, maxAlt),
    [optimizedAlts, plotW, plotH, minAlt, maxAlt]
  );

  // Contrail risk zones from baseline
  const riskZones = baseline.waypointResults.map((wp, i) => ({
    index: i,
    persistent: wp.persistent,
    sacSatisfied: wp.sacSatisfied,
  }));

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="mb-4 text-lg font-semibold">Altitude Profile</h3>
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full max-w-[600px]"
          >
            {/* Background contrail risk zones */}
            {riskZones.map((zone, i) => {
              if (!zone.sacSatisfied) return null;
              const x = padding.left + (i / (riskZones.length - 1)) * plotW;
              const w = plotW / (riskZones.length - 1);
              return (
                <rect
                  key={i}
                  x={x - w / 2}
                  y={padding.top}
                  width={w}
                  height={plotH}
                  fill={zone.persistent ? "rgba(239, 68, 68, 0.1)" : "rgba(251, 191, 36, 0.08)"}
                />
              );
            })}

            {/* Y-axis labels */}
            {[minAlt, (minAlt + maxAlt) / 2, maxAlt].map((alt) => {
              const y =
                padding.top + plotH - ((alt - minAlt) / (maxAlt - minAlt)) * plotH;
              return (
                <g key={alt}>
                  <text
                    x={padding.left - 5}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-muted-foreground text-[10px]"
                  >
                    FL{Math.round(alt / 100)}
                  </text>
                  <line
                    x1={padding.left}
                    x2={chartWidth - padding.right}
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity={0.1}
                  />
                </g>
              );
            })}

            {/* X-axis labels */}
            <text
              x={padding.left}
              y={chartHeight - 5}
              className="fill-muted-foreground text-[10px]"
            >
              Departure
            </text>
            <text
              x={chartWidth - padding.right}
              y={chartHeight - 5}
              textAnchor="end"
              className="fill-muted-foreground text-[10px]"
            >
              Arrival
            </text>

            {/* Baseline path */}
            <path
              d={baselinePath}
              fill="none"
              stroke="rgb(239, 68, 68)"
              strokeWidth={2}
              strokeDasharray="6 3"
              transform={`translate(${padding.left}, ${padding.top})`}
            />

            {/* Optimized path */}
            <path
              d={optimizedPath}
              fill="none"
              stroke="rgb(34, 197, 94)"
              strokeWidth={2.5}
              transform={`translate(${padding.left}, ${padding.top})`}
            />
          </svg>
        </div>

        <div className="mt-3 flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-5 border-t-2 border-dashed border-red-500" />
            <span className="text-muted-foreground">Baseline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-5 bg-green-500" />
            <span className="text-muted-foreground">Optimized</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-red-500/10" />
            <span className="text-muted-foreground">Contrail risk zone</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function estimateAltitude(index: number, total: number): number {
  const f = index / (total - 1);
  const cruise = 35000;
  if (f < 0.1) return cruise * (f / 0.1);
  if (f > 0.9) return cruise * ((1 - f) / 0.1);
  return cruise;
}

function buildPath(
  alts: number[],
  width: number,
  height: number,
  minAlt: number,
  maxAlt: number
): string {
  const range = maxAlt - minAlt || 1;
  return alts
    .map((alt, i) => {
      const x = (i / (alts.length - 1)) * width;
      const y = height - ((alt - minAlt) / range) * height;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}
