// Airport coordinates for great-circle interpolation
export const AIRPORT_COORDS: Record<
  string,
  { latitude: number; longitude: number }
> = {
  JFK: { latitude: 40.6413, longitude: -73.7781 },
  LAX: { latitude: 33.9425, longitude: -118.4081 },
  ORD: { latitude: 41.9742, longitude: -87.9073 },
  ATL: { latitude: 33.6407, longitude: -84.4277 },
  DFW: { latitude: 32.8998, longitude: -97.0403 },
  DEN: { latitude: 39.8561, longitude: -104.6737 },
  SFO: { latitude: 37.6213, longitude: -122.379 },
  SEA: { latitude: 47.4502, longitude: -122.3088 },
  MIA: { latitude: 25.7959, longitude: -80.287 },
  BOS: { latitude: 42.3656, longitude: -71.0096 },
  LHR: { latitude: 51.47, longitude: -0.4543 },
  CDG: { latitude: 49.0097, longitude: 2.5479 },
  NRT: { latitude: 35.7647, longitude: 140.3864 },
  SIN: { latitude: 1.3644, longitude: 103.9915 },
  DXB: { latitude: 25.2532, longitude: 55.3657 },
};
