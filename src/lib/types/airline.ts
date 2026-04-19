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
  narrative: string; // K2 Think generated explanation
  fleetProfile: FleetProfile;
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
