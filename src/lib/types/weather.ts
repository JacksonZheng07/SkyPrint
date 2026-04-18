export interface AtmosphericLayer {
  pressureHpa: number;
  altitudeFt: number;
  temperatureC: number;
  relativeHumidity: number;
  windSpeedKts: number;
  windDirection: number;
}

export interface WeatherProfile {
  latitude: number;
  longitude: number;
  time: string;
  layers: AtmosphericLayer[];
}

export interface WeatherGrid {
  profiles: WeatherProfile[];
  source: "gfs" | "era5" | "open_meteo";
  fetchedAt: string;
}
