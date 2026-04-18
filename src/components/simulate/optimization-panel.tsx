"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SimulationResult } from "@/lib/types/comparison";
import { formatCo2 } from "@/lib/utils/format";

interface OptimizationPanelProps {
  result: SimulationResult;
}

export function OptimizationPanel({ result }: OptimizationPanelProps) {
  const { baseline, optimized, altitudeAdjustments, efReductionPercent, fuelPenaltyPercent } =
    result;

  const co2Saved = baseline.co2Kg - optimized.co2Kg;
  const contrailReduced =
    baseline.summary.contrailProbability - optimized.summary.contrailProbability;
  const rfReduced = baseline.summary.meanRfNetWM2 - optimized.summary.meanRfNetWM2;

  return (
    <div className="space-y-4">
      {/* Summary metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Contrail EF Reduction"
          value={`${Math.round(efReductionPercent)}%`}
          description="Energy forcing reduction"
          positive={efReductionPercent > 0}
        />
        <MetricCard
          label="Fuel Penalty"
          value={`+${fuelPenaltyPercent.toFixed(1)}%`}
          description="Additional fuel burn"
          positive={fuelPenaltyPercent < 3}
        />
        <MetricCard
          label="CO2 Difference"
          value={co2Saved > 0 ? `-${formatCo2(co2Saved)}` : `+${formatCo2(Math.abs(co2Saved))}`}
          description={co2Saved > 0 ? "Saved" : "Additional"}
          positive={co2Saved >= 0}
        />
        <MetricCard
          label="Contrail Probability"
          value={`${Math.round(contrailReduced * 100)}%`}
          description="Reduction in formation risk"
          positive={contrailReduced > 0}
        />
      </div>

      {/* RF comparison */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Radiative Forcing Comparison</h3>
          <div className="space-y-3">
            <RFBar
              label="Baseline"
              value={baseline.summary.meanRfNetWM2}
              maxValue={Math.max(
                Math.abs(baseline.summary.meanRfNetWM2),
                Math.abs(optimized.summary.meanRfNetWM2),
                0.001
              )}
              color="bg-red-500"
            />
            <RFBar
              label="Optimized"
              value={optimized.summary.meanRfNetWM2}
              maxValue={Math.max(
                Math.abs(baseline.summary.meanRfNetWM2),
                Math.abs(optimized.summary.meanRfNetWM2),
                0.001
              )}
              color="bg-green-500"
            />
          </div>
          {rfReduced > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              Net RF reduced by {((rfReduced / (baseline.summary.meanRfNetWM2 || 1)) * 100).toFixed(0)}%
              — equivalent to removing the warming effect of contrails for this route.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Altitude adjustments */}
      {altitudeAdjustments.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-lg font-semibold">
              Altitude Adjustments ({altitudeAdjustments.length})
            </h3>
            <div className="space-y-2">
              {altitudeAdjustments.map((adj, i) => {
                const delta = adj.suggestedAltitudeFt - adj.originalAltitudeFt;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <div>
                      <span className="font-medium">
                        Waypoint {adj.waypointIndex + 1}
                      </span>
                      <span className="ml-2 text-muted-foreground">
                        FL{Math.round(adj.originalAltitudeFt / 100)} →
                        FL{Math.round(adj.suggestedAltitudeFt / 100)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={delta < 0 ? "default" : "secondary"}>
                        {delta > 0 ? "+" : ""}
                        {delta.toLocaleString()} ft
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {adj.reason}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  positive,
}: {
  label: string;
  value: string;
  description: string;
  positive: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p
          className={`mt-1 text-2xl font-bold ${
            positive ? "text-green-600" : "text-amber-500"
          }`}
        >
          {value}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function RFBar({
  label,
  value,
  maxValue,
  color,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}) {
  const pct = Math.abs(value / maxValue) * 100;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {value.toFixed(4)} W/m²
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-muted">
        <div
          className={`h-3 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}
