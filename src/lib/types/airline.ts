export interface AirlineScore {
  airlineCode: string;
  airlineName: string;
  overallGrade: "A" | "B" | "C" | "D" | "F";
  overallScore: number; // 0-100
  categories: {
    fleetEfficiency: number;
    routeOptimization: number;
    contrailMitigation: number;
    sustainableFuel: number;
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
