import { optimizeAltitude } from "@/lib/clients/contrail-engine";
import { getDemoSimulationResult } from "@/lib/demo/flights";
import type { SimulationResult } from "@/lib/types/comparison";
import type { Waypoint } from "@/lib/types/flight";

export async function simulateRoute(
  waypoints: Waypoint[],
  aircraftType: string
): Promise<SimulationResult> {
  try {
    const result = await optimizeAltitude(waypoints, aircraftType);
    return {
      baseline: result.original,
      optimized: result.optimized,
      altitudeAdjustments: result.altitudeAdjustments,
      efReductionPercent: result.efReductionPercent,
      fuelPenaltyPercent: calculateFuelPenalty(result.altitudeAdjustments),
    };
  } catch {
    // Fall back to demo simulation data
    return getDemoSimulationResult(waypoints.length);
  }
}

function calculateFuelPenalty(
  adjustments: { originalAltitudeFt: number; suggestedAltitudeFt: number }[]
): number {
  if (adjustments.length === 0) return 0;
  // Each 1000ft altitude change adds ~0.5% fuel penalty
  const totalDelta = adjustments.reduce(
    (sum, a) => sum + Math.abs(a.suggestedAltitudeFt - a.originalAltitudeFt),
    0
  );
  return Math.round((totalDelta / adjustments.length / 1000) * 0.5 * 10) / 10;
}
