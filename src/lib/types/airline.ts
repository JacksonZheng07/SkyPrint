export interface AirlineScore {
  airlineCode: string;
  airlineName: string;
  overallGrade: "A" | "B" | "C" | "D" | "F";
  overallScore: number; // 0-100
  tier: string; // "Sky Saints" | "Clean Cruisers" | etc.
  categories: {
    contrailMitigation: number;   // weight 30%
    fleetEfficiency: number;      // weight 25%
    sustainableFuel: number;      // weight 20%
    routeOptimization: number;    // weight 15%
    emissionsTrajectory: number;  // weight 10%
  };
  safPercent: number;
  narrative: string; // K2 Think generated explanation
  report: AirlineReport; // K2 Think full report, local fallback if K2 unavailable
  fleetProfile: FleetProfile;
}

export interface AirlineReport {
  executiveSummary: string;
  contrailAnalysis: string;
  fleetAssessment: string;
  safOutlook: string;
  recommendations: string[];
  gradeJustification: string;
}

export interface FleetProfile {
  totalAircraft: number;
  averageAge: number;
  aircraftTypes: {
    type: string;
    count: number;
    fuelEfficiency: number; // L/100km/pax
  }[];
}
