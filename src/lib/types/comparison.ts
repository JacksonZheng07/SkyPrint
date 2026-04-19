import type { ContrailMetrics, ContrailPrediction } from "./contrail";
import type { FlightOption } from "./flight";

export interface ImpactSummary {
  co2Kg: number;
  co2Saved: number;
  treeEquivalent: number;
  carMilesEquivalent: number;
}

export interface FlightComparisonItem {
  flight: FlightOption;
  contrail: ContrailPrediction;
  metrics: ContrailMetrics;
  totalImpactScore: number; // lower is better
  rank: number;
  warmingRatio: number; // ratio vs best option (1.0 for best, >1 for others)
  impactCopy: string; // dynamic comparison copy
  confidenceLevel: "high" | "medium" | "low";
}

export interface FlightComparison {
  origin: string;
  destination: string;
  date: string;
  flights: FlightComparisonItem[];
  bestOption: FlightComparisonItem;
  worstOption: FlightComparisonItem;
  averageCo2Kg: number;
  warmingSpreadPct: number; // (worst - best) / worst * 100
}

export interface SimulationResult {
  baseline: ContrailPrediction;
  optimized: ContrailPrediction;
  altitudeAdjustments: AltitudeAdjustment[];
  efReductionPercent: number;
  fuelPenaltyPercent: number;
}

export interface AltitudeAdjustment {
  waypointIndex: number;
  originalAltitudeFt: number;
  suggestedAltitudeFt: number;
  reason: string;
}
