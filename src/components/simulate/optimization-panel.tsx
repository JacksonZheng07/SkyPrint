"use client";

import type { SimulationResult } from "@/lib/types/comparison";
import { formatCo2 } from "@/lib/utils/format";
import { MetricCard } from "./metric-card";
import { RfComparisonCard } from "./rf-comparison-card";
import { AltitudeAdjustmentsCard } from "./altitude-adjustments-card";

function formatCo2Delta(savedKg: number): string {
  if (savedKg > 0) return `-${formatCo2(savedKg)}`;
  return `+${formatCo2(Math.abs(savedKg))}`;
}

export function OptimizationPanel({ result }: { result: SimulationResult }) {
  const { baseline, optimized, altitudeAdjustments, efReductionPercent, fuelPenaltyPercent } = result;
  const co2Saved = baseline.co2Kg - optimized.co2Kg;
  const contrailReduced =
    baseline.summary.contrailProbability - optimized.summary.contrailProbability;

  return (
    <div className="space-y-4">
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
          value={formatCo2Delta(co2Saved)}
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

      <RfComparisonCard
        baselineRf={baseline.summary.meanRfNetWM2}
        optimizedRf={optimized.summary.meanRfNetWM2}
      />

      <AltitudeAdjustmentsCard adjustments={altitudeAdjustments} />
    </div>
  );
}
