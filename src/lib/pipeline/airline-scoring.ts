import type { AirlineScore, FleetProfile } from "@/lib/types/airline";
import type { AirlineStaticData } from "./airline-data";

/** Best observed per-passenger fuel efficiency (lower is better). */
const BEST_EFFICIENCY = 2.4;
/** Worst observed per-passenger fuel efficiency. */
const WORST_EFFICIENCY = 3.8;
/** Age at which age penalty becomes zero. */
const AGE_PENALTY_PIVOT = 16;

export function computeFleetEfficiency(fleet: FleetProfile): number {
  const totalCount = fleet.aircraftTypes.reduce((sum, t) => sum + t.count, 0);
  const avgEfficiency =
    fleet.aircraftTypes.reduce((sum, t) => sum + t.fuelEfficiency * t.count, 0) / totalCount;

  const efficiencyScore =
    ((WORST_EFFICIENCY - avgEfficiency) / (WORST_EFFICIENCY - BEST_EFFICIENCY)) * 80;
  const ageBonus = (AGE_PENALTY_PIVOT - fleet.averageAge) * 2;
  return Math.max(0, Math.min(100, efficiencyScore + ageBonus));
}

export function computeContrailMitigation(active: boolean): number {
  return active ? 65 : 25;
}

export function computeSustainableFuelScore(safPercent: number): number {
  return Math.min(100, safPercent * 20);
}

export function computeOverallScore(
  categories: AirlineScore["categories"],
): number {
  return Math.round(
    categories.fleetEfficiency * 0.3 +
      categories.routeOptimization * 0.25 +
      categories.contrailMitigation * 0.3 +
      categories.sustainableFuel * 0.15,
  );
}

export function computeCategories(data: AirlineStaticData): AirlineScore["categories"] {
  return {
    fleetEfficiency: Math.round(computeFleetEfficiency(data.fleet)),
    routeOptimization: Math.round(data.routeOptScore),
    contrailMitigation: Math.round(computeContrailMitigation(data.contrailProgramActive)),
    sustainableFuel: Math.round(computeSustainableFuelScore(data.safPercent)),
  };
}
