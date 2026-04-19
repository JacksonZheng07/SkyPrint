import type { FleetProfile } from "@/lib/types/airline";

export interface AirlineStaticData {
  name: string;
  fleet: FleetProfile;
  /** Sustainable aviation fuel adoption percentage (0-100). */
  safPercent: number;
  /** Internal estimate of route optimization quality (0-100). */
  routeOptScore: number;
  /** Whether the airline operates an active contrail avoidance program. */
  contrailProgramActive: boolean;
}

export const AIRLINE_DATA: Record<string, AirlineStaticData> = {
  AA: {
    name: "American Airlines",
    fleet: {
      totalAircraft: 948,
      averageAge: 12.1,
      aircraftTypes: [
        { type: "B738", count: 304, fuelEfficiency: 3.2 },
        { type: "A321", count: 219, fuelEfficiency: 2.8 },
        { type: "B77W", count: 47, fuelEfficiency: 3.5 },
        { type: "B789", count: 42, fuelEfficiency: 2.5 },
      ],
    },
    safPercent: 1.2,
    routeOptScore: 55,
    contrailProgramActive: false,
  },
  UA: {
    name: "United Airlines",
    fleet: {
      totalAircraft: 870,
      averageAge: 14.3,
      aircraftTypes: [
        { type: "B738", count: 141, fuelEfficiency: 3.2 },
        { type: "B789", count: 60, fuelEfficiency: 2.5 },
        { type: "B77W", count: 96, fuelEfficiency: 3.5 },
        { type: "A320", count: 99, fuelEfficiency: 3.0 },
      ],
    },
    safPercent: 2.1,
    routeOptScore: 62,
    contrailProgramActive: true,
  },
  DL: {
    name: "Delta Air Lines",
    fleet: {
      totalAircraft: 895,
      averageAge: 15.8,
      aircraftTypes: [
        { type: "B738", count: 77, fuelEfficiency: 3.2 },
        { type: "A321", count: 127, fuelEfficiency: 2.8 },
        { type: "A332", count: 31, fuelEfficiency: 3.3 },
        { type: "A359", count: 37, fuelEfficiency: 2.4 },
      ],
    },
    safPercent: 1.5,
    routeOptScore: 58,
    contrailProgramActive: false,
  },
  BA: {
    name: "British Airways",
    fleet: {
      totalAircraft: 254,
      averageAge: 13.5,
      aircraftTypes: [
        { type: "A320", count: 67, fuelEfficiency: 3.0 },
        { type: "A359", count: 18, fuelEfficiency: 2.4 },
        { type: "B77W", count: 43, fuelEfficiency: 3.5 },
        { type: "B789", count: 12, fuelEfficiency: 2.5 },
      ],
    },
    safPercent: 0.8,
    routeOptScore: 50,
    contrailProgramActive: false,
  },
  LH: {
    name: "Lufthansa",
    fleet: {
      totalAircraft: 284,
      averageAge: 11.2,
      aircraftTypes: [
        { type: "A320", count: 68, fuelEfficiency: 3.0 },
        { type: "A321", count: 57, fuelEfficiency: 2.8 },
        { type: "A359", count: 21, fuelEfficiency: 2.4 },
        { type: "B789", count: 8, fuelEfficiency: 2.5 },
      ],
    },
    safPercent: 1.8,
    routeOptScore: 65,
    contrailProgramActive: true,
  },
};

export function getSupportedAirlines(): string[] {
  return Object.keys(AIRLINE_DATA);
}
