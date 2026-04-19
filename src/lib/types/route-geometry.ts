export interface RouteGeometryPoint {
  timeUnix: number;
  latitude: number;
  longitude: number;
  altitudeFt: number;
  contrailRisk: boolean;
}

export interface RouteHistoryRequest {
  callsign: string;
  icao24: string;
  departureTimeUnix: number;
  aircraftType: string;
}

export interface RouteHistoryResponse {
  flightId: string;
  callsign: string;
  icao24: string;
  aircraftType: string;

  /** Actual flown path — coordinate array for globe rendering. */
  originalPath: RouteGeometryPoint[];
  /** Contrail-optimal path — same lat/lon, cruise altitudes shifted. */
  optimalPath: RouteGeometryPoint[];

  /** Per-passenger CO2 [kg] for the actual flown path (ICAO polynomial). */
  co2KgOriginal: number;
  /** Per-passenger CO2 [kg] for the optimal path. */
  co2KgOptimal: number;
  /** co2KgOptimal − co2KgOriginal. Positive = optimal uses slightly more fuel. */
  co2KgDelta: number;

  nContrailWaypoints: number;
  nTotalWaypoints: number;

  /** Estimated fuel penalty from altitude adjustments [%]. Capped at 2 % (Teoh 2020). */
  fuelPenaltyPct: number;
  /** Fraction of contrail-forming cruise waypoints eliminated [%]. */
  efReductionPct: number;

  avoidable: boolean;
  /** Always true for on-demand queries; ERA5/CoCiP used only in batch pipeline. */
  usedSacFallback: boolean;

  altitudeAdjustments: {
    waypoint_index: number;
    original_altitude_ft: number;
    suggested_altitude_ft: number;
    reason: string;
  }[];
}
