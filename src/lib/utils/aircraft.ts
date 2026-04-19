/**
 * Centralized aircraft reference data.
 * Single source of truth for fuel efficiency, engine generation, and soot index.
 * Used by: compare pipeline, k2-reasoning, demo flights, impact scoring.
 */

export interface AircraftInfo {
  fuelEfficiency: number; // L / 100 pax-km (lower = better)
  engineGen: "new" | "legacy";
  sootIndex: "very_low" | "low" | "medium" | "high" | "very_high";
  typicalSeats: number;
}

/**
 * Fuel efficiency reference — aligned with airline-data.ts fleet profiles.
 * Sources: ICAO Carbon Emissions Calculator, manufacturer data, IBA iFleet.
 */
export const AIRCRAFT_DATA: Record<string, AircraftInfo> = {
  // New-gen narrowbodies
  A220: { fuelEfficiency: 2.3, engineGen: "new", sootIndex: "very_low", typicalSeats: 130 },
  A320: { fuelEfficiency: 3.0, engineGen: "legacy", sootIndex: "medium", typicalSeats: 170 },
  A321: { fuelEfficiency: 2.8, engineGen: "legacy", sootIndex: "medium", typicalSeats: 200 },
  A319: { fuelEfficiency: 3.1, engineGen: "legacy", sootIndex: "medium", typicalSeats: 140 },
  // Boeing narrowbodies
  B738: { fuelEfficiency: 3.2, engineGen: "legacy", sootIndex: "medium", typicalSeats: 162 },
  B739: { fuelEfficiency: 3.1, engineGen: "legacy", sootIndex: "medium", typicalSeats: 177 },
  // New-gen widebodies
  B789: { fuelEfficiency: 2.5, engineGen: "new", sootIndex: "low", typicalSeats: 290 },
  B78X: { fuelEfficiency: 2.6, engineGen: "new", sootIndex: "low", typicalSeats: 318 },
  A359: { fuelEfficiency: 2.4, engineGen: "new", sootIndex: "low", typicalSeats: 325 },
  A35K: { fuelEfficiency: 2.3, engineGen: "new", sootIndex: "low", typicalSeats: 366 },
  A339: { fuelEfficiency: 2.9, engineGen: "new", sootIndex: "low", typicalSeats: 260 },
  // Legacy widebodies
  B77W: { fuelEfficiency: 3.5, engineGen: "legacy", sootIndex: "high", typicalSeats: 396 },
  A332: { fuelEfficiency: 3.3, engineGen: "legacy", sootIndex: "high", typicalSeats: 247 },
  A333: { fuelEfficiency: 3.3, engineGen: "legacy", sootIndex: "high", typicalSeats: 277 },
  A388: { fuelEfficiency: 3.8, engineGen: "legacy", sootIndex: "high", typicalSeats: 555 },
  B744: { fuelEfficiency: 4.2, engineGen: "legacy", sootIndex: "very_high", typicalSeats: 416 },
  B763: { fuelEfficiency: 3.6, engineGen: "legacy", sootIndex: "high", typicalSeats: 218 },
  // Regional
  E190: { fuelEfficiency: 3.4, engineGen: "legacy", sootIndex: "high", typicalSeats: 97 },
};

const DEFAULT_AIRCRAFT: AircraftInfo = {
  fuelEfficiency: 3.0, engineGen: "legacy", sootIndex: "medium", typicalSeats: 180,
};

export function getAircraftInfo(type: string): AircraftInfo {
  return AIRCRAFT_DATA[type] ?? DEFAULT_AIRCRAFT;
}

export function getFuelEfficiency(type: string): number {
  return (AIRCRAFT_DATA[type] ?? DEFAULT_AIRCRAFT).fuelEfficiency;
}

export function isNewGenEngine(type: string): boolean {
  return (AIRCRAFT_DATA[type] ?? DEFAULT_AIRCRAFT).engineGen === "new";
}

/**
 * ICAO-methodology CO2 per passenger calculation.
 * This is the single source of truth for CO2 estimation across the app.
 */
export function calculateCo2PerPax(params: {
  aircraftType: string;
  distanceKm: number;
  stops?: number;
  loadFactor?: number;
}): number {
  const { aircraftType, distanceKm, stops = 0, loadFactor = 0.82 } = params;
  const fuelEff = getFuelEfficiency(aircraftType);
  const isShortHaul = distanceKm < 1500;

  const taxiOverhead = isShortHaul ? 1.05 : 1.03;
  const climbOverhead = isShortHaul ? 1.12 : 1.08;
  const routingOverhead = 1.03;
  const stopsOverhead = 1 + stops * 0.08;
  const loadAdjustment = 0.82 / loadFactor;

  const baseFuelL = (fuelEff * distanceKm) / 100;
  const adjustedFuelL = baseFuelL * taxiOverhead * climbOverhead * routingOverhead * stopsOverhead * loadAdjustment;
  return Math.round(adjustedFuelL * 2.54); // ICAO: 3.16 kg CO2/kg × 0.804 kg/L
}

/**
 * Contrail impact score (0-100) based on aircraft, time-of-day, and route.
 * Single source of truth for contrail scoring across the app.
 */
export function calculateContrailScore(params: {
  aircraftType: string;
  departureHourUTC: number;
  durationMinutes: number;
  distanceKm: number;
}): { impactScore: number; riskRating: "low" | "medium" | "high" } {
  const { aircraftType, departureHourUTC: depHour, durationMinutes, distanceKm } = params;
  const isShortHaul = distanceKm < 1500;
  const durationHours = durationMinutes / 60;

  const sootFactor = isNewGenEngine(aircraftType) ? 0.6 : 1.0;
  const nightFactor = depHour >= 18 || depHour < 6 ? 1.4
    : (depHour >= 6 && depHour < 8) || (depHour >= 16 && depHour < 18) ? 1.15
    : 0.75;
  const durationFactor = Math.min(1.5, 0.5 + durationHours / 8);
  const altitudeFactor = isShortHaul ? 0.6 : 1.0;

  const raw = 35 * sootFactor * nightFactor * durationFactor * altitudeFactor;
  const impactScore = Math.min(100, Math.max(0, Math.round(raw)));
  const riskRating: "low" | "medium" | "high" =
    impactScore < 25 ? "low" : impactScore < 60 ? "medium" : "high";

  return { impactScore, riskRating };
}
