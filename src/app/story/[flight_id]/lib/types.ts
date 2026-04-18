// Types for the flight analysis data contract.
// All fields match the pipeline output schema exactly.

export interface TrackPoint {
  t: string; // ISO UTC timestamp
  lat: number;
  lon: number;
  alt_ft: number;
  tas_ms: number;
  fuel_burn_kg_s: number;
  in_issr: boolean;
  segment_forcing_j_m: number;
}

export interface ForcingValue {
  value: number;
  ci_low: number;
  ci_high: number;
  method: string;
  source: string;
}

export interface FlightAnalysis {
  flight_id: string;
  metadata: {
    callsign: string;
    iata: string;
    airline_icao: string;
    aircraft_type: string;
    origin: string;
    destination: string;
    departure_utc: string;
    duration_seconds: number;
    data_sources: Record<
      string,
      { source: string; retrieved_utc: string }
    >;
  };
  track_actual: TrackPoint[];
  track_counterfactual: TrackPoint[];
  issr_geojson_path: string;
  totals: {
    actual: {
      co2_fuel_kg: ForcingValue;
      contrail_forcing_tco2e: ForcingValue;
      non_co2_other_tco2e: ForcingValue;
      total_warming_tco2e: ForcingValue;
    };
    counterfactual: {
      co2_fuel_kg: ForcingValue;
      contrail_forcing_tco2e: ForcingValue;
      non_co2_other_tco2e: ForcingValue;
      total_warming_tco2e: ForcingValue;
    };
    avoidable_warming_tco2e: ForcingValue;
    fuel_penalty_kg: number;
    fuel_penalty_pct: number;
  };
  counterfactual_spec: {
    method: string;
    offsets_evaluated_ft: number[];
    fuel_constraint: string;
    selected_offset_ft_by_segment: number[];
  };
  airline_context: {
    carrier_name: string;
    rank: number;
    total_carriers: number;
    flights_analyzed: number;
    leaderboard: Array<{
      carrier: string;
      avoidable_tco2e_per_flight: ForcingValue;
    }>;
  };
  assumptions: Array<{
    field: string;
    value: unknown;
    source: string;
    url: string;
  }>;
  data_gaps: string[];
}
