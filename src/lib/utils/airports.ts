// Airport coordinates for great-circle interpolation
export const AIRPORT_COORDS: Record<
  string,
  { latitude: number; longitude: number }
> = {
  // North America
  JFK: { latitude: 40.6413, longitude: -73.7781 },
  EWR: { latitude: 40.6895, longitude: -74.1745 },
  BOS: { latitude: 42.3656, longitude: -71.0096 },
  ORD: { latitude: 41.9742, longitude: -87.9073 },
  ATL: { latitude: 33.6407, longitude: -84.4277 },
  IAD: { latitude: 38.9531, longitude: -77.4565 },
  MIA: { latitude: 25.7959, longitude: -80.287 },
  LAX: { latitude: 33.9425, longitude: -118.4081 },
  DFW: { latitude: 32.8998, longitude: -97.0403 },
  DEN: { latitude: 39.8561, longitude: -104.6737 },
  SFO: { latitude: 37.6213, longitude: -122.379 },
  SEA: { latitude: 47.4502, longitude: -122.3088 },
  // Europe — NAT corridor arrivals
  LHR: { latitude: 51.47, longitude: -0.4543 },
  CDG: { latitude: 49.0097, longitude: 2.5479 },
  AMS: { latitude: 52.3086, longitude: 4.7639 },
  FRA: { latitude: 50.0379, longitude: 8.5622 },
  DUB: { latitude: 53.4213, longitude: -6.2701 },
  MAD: { latitude: 40.4983, longitude: -3.5676 },
  ZRH: { latitude: 47.4647, longitude: 8.5492 },
  MAN: { latitude: 53.3537, longitude: -2.275 },
  FCO: { latitude: 41.7999, longitude: 12.2462 },
  BCN: { latitude: 41.2974, longitude: 2.0833 },
  CPH: { latitude: 55.618, longitude: 12.6508 },
  ARN: { latitude: 59.6498, longitude: 17.9238 },
  OSL: { latitude: 60.1939, longitude: 11.1004 },
  LIS: { latitude: 38.7756, longitude: -9.1354 },
  // Asia-Pacific / Middle East
  NRT: { latitude: 35.7647, longitude: 140.3864 },
  SIN: { latitude: 1.3644, longitude: 103.9915 },
  DXB: { latitude: 25.2532, longitude: 55.3657 },
};

// ICAO 4-letter → IATA 3-letter for airports appearing in the NAT manifest
export const ICAO_TO_IATA: Record<string, string> = {
  KJFK: "JFK", KEWR: "EWR", KBOS: "BOS", KORD: "ORD",
  KATL: "ATL", KIAD: "IAD", KMIA: "MIA",
  EGLL: "LHR", LFPG: "CDG", EHAM: "AMS", EDDF: "FRA",
  EIDW: "DUB", LEMD: "MAD", LSZH: "ZRH", EGCC: "MAN",
  LIRF: "FCO", LEBL: "BCN", EKCH: "CPH", ESSA: "ARN",
  ENGM: "OSL", LPPT: "LIS",
};
