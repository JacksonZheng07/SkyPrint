import type { ContrailMetrics, ContrailPrediction, ContrailRiskRating } from "@/lib/types/contrail";
import type { ImpactSummary } from "@/lib/types/comparison";
import { co2ToCarMiles, co2ToTrees } from "@/lib/utils/units";

export function calculateContrailMetrics(
  prediction: ContrailPrediction
): ContrailMetrics {
  const prob = prediction.summary.contrailProbability;
  const rf = Math.abs(prediction.summary.meanRfNetWM2);

  // Impact score: weighted combination of probability and radiative forcing
  // Normalized to 0-100 scale
  const impactScore = Math.min(100, Math.round(prob * 50 + rf * 2000));

  let riskRating: ContrailRiskRating;
  if (impactScore < 25) {
    riskRating = "low";
  } else if (impactScore < 60) {
    riskRating = "medium";
  } else {
    riskRating = "high";
  }

  return {
    riskRating,
    impactScore,
    formationAltitudeFt: undefined, // Derived from waypoint data if needed
    persistenceHours: prediction.summary.maxContrailLifetimeHours || undefined,
  };
}

export function calculateTotalImpactScore(
  co2Kg: number,
  contrailMetrics: ContrailMetrics,
  averageCo2Kg: number
): number {
  // Total impact = CO2 component + contrail component
  // Contrail impact is weighted MORE heavily (the core thesis of SkyPrint)
  const co2Normalized = averageCo2Kg > 0 ? (co2Kg / averageCo2Kg) * 40 : 40;
  const contrailComponent = contrailMetrics.impactScore * 0.6;

  return Math.round(co2Normalized + contrailComponent);
}

export function calculateImpactSummary(
  co2Kg: number,
  averageCo2Kg: number
): ImpactSummary {
  const co2Saved = Math.max(0, averageCo2Kg - co2Kg);

  return {
    co2Kg: Math.round(co2Kg),
    co2Saved: Math.round(co2Saved),
    treeEquivalent: co2ToTrees(co2Saved),
    carMilesEquivalent: co2ToCarMiles(co2Saved),
  };
}
