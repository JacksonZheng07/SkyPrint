export interface WaypointContrailResult {
  sacSatisfied: boolean;
  persistent: boolean;
  rfNetWM2: number | null;
  contrailAgeHours: number | null;
  efJPerM: number | null;
}

export interface ContrailSummary {
  contrailProbability: number; // fraction 0-1
  totalEnergyForcingJ: number;
  meanRfNetWM2: number;
  maxContrailLifetimeHours: number;
}

export interface ContrailPrediction {
  flightId: string;
  waypointResults: WaypointContrailResult[];
  summary: ContrailSummary;
  co2Kg: number;
  usedFallback: boolean;
}

export type ContrailRiskRating = "low" | "medium" | "high";

export interface ContrailMetrics {
  riskRating: ContrailRiskRating;
  impactScore: number; // 0-100
  formationAltitudeFt?: number;
  persistenceHours?: number;
}
