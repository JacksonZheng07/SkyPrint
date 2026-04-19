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
    ((WORST_EFFICIENCY - avgEfficiency) / (WORST_EFFICIENCY - BEST_EFFICIENCY)) * 85;
  const ageBonus = (AGE_PENALTY_PIVOT - fleet.averageAge) * 3;
  return Math.max(0, Math.min(100, efficiencyScore + ageBonus));
}

/**
 * Graduated contrail mitigation score.
 * Active formal program (UA/Google, BA/NATS, LH, JL/Breakthrough) -> 92
 * No program -> 32
 */
export function computeContrailMitigation(active: boolean): number {
  return active ? 92 : 32;
}

export function computeSustainableFuelScore(safPercent: number): number {
  // Stepped scale — rewards early adopters aggressively
  if (safPercent >= 1.2) return 88;
  if (safPercent >= 1.0) return 82;
  if (safPercent >= 0.8) return 75;
  if (safPercent >= 0.5) return 65;
  if (safPercent >= 0.3) return 50;
  if (safPercent >= 0.1) return 30;
  return 12;
}

/** Emissions trajectory: active contrail programs signal improving trend. */
export function computeEmissionsTrajectory(
  contrailProgramActive: boolean,
  fleetAge: number,
): number {
  if (contrailProgramActive && fleetAge < 12) return 90;
  if (contrailProgramActive) return 78;
  if (fleetAge < 8) return 72;
  if (fleetAge < 12) return 58;
  return 40;
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

/** Tier labels — aligned with plus/minus grade boundaries from grades.ts. */
export function scoreToTier(score: number): string {
  if (score >= 80) return "Sky Saints";         // A- and above
  if (score >= 65) return "Clean Cruisers";     // B- and above
  if (score >= 50) return "Middle of the Pack"; // C and above
  if (score >= 35) return "Greenwash Gold Medalists"; // D and above
  return "Contrail Criminals";                  // below D
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
