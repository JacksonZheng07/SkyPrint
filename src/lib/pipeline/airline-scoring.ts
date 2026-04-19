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

/**
 * Graduated contrail mitigation score.
 * Active formal program (like UA with Google) -> 65
 * No program -> 25
 */
export function computeContrailMitigation(active: boolean): number {
  return active ? 65 : 25;
}

export function computeSustainableFuelScore(safPercent: number): number {
  return Math.min(100, safPercent * 20);
}

/** Emissions trajectory: active contrail programs signal improving trend. */
export function computeEmissionsTrajectory(
  contrailProgramActive: boolean,
  fleetAge: number,
): number {
  if (contrailProgramActive) return 65;
  if (fleetAge < 10) return 60;
  return 45;
}

/** Spec weights: contrail 30%, fuel 25%, SAF 20%, route 15%, trajectory 10%. */
export function computeOverallScore(
  categories: AirlineScore["categories"],
): number {
  return Math.round(
    categories.contrailMitigation * 0.30 +
      categories.fleetEfficiency * 0.25 +
      categories.sustainableFuel * 0.20 +
      categories.routeOptimization * 0.15 +
      categories.emissionsTrajectory * 0.10,
  );
}

/** Tier labels per spec. */
export function scoreToTier(score: number): string {
  if (score >= 75) return "Sky Saints";
  if (score >= 60) return "Clean Cruisers";
  if (score >= 45) return "Middle of the Pack";
  if (score >= 30) return "Greenwash Gold Medalists";
  return "Contrail Criminals";
}

export function computeCategories(data: AirlineStaticData): AirlineScore["categories"] {
  return {
    contrailMitigation: Math.round(computeContrailMitigation(data.contrailProgramActive)),
    fleetEfficiency: Math.round(computeFleetEfficiency(data.fleet)),
    sustainableFuel: Math.round(computeSustainableFuelScore(data.safPercent)),
    routeOptimization: Math.round(data.routeOptScore),
    emissionsTrajectory: Math.round(
      computeEmissionsTrajectory(data.contrailProgramActive, data.fleet.averageAge),
    ),
  };
}
