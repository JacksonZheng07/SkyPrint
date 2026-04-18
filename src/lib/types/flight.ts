export interface Waypoint {
  latitude: number;
  longitude: number;
  altitudeFt: number;
  time: string; // ISO 8601 UTC
}

export interface FlightOption {
  flightId: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: string; // IATA code
  destination: string;
  departureTime: string;
  arrivalTime: string;
  aircraftType: string;
  duration: number; // minutes
  stops: number;
  waypoints?: Waypoint[];
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  date: string; // YYYY-MM-DD
}

export type AircraftType =
  | "B738"
  | "B739"
  | "B77W"
  | "B789"
  | "B78X"
  | "A320"
  | "A321"
  | "A332"
  | "A333"
  | "A359"
  | "A35K"
  | "E190";
