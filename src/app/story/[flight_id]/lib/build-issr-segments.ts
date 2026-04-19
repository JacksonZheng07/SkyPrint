import type { TrackPoint } from "./types";

/**
 * Split a track into LineString features for every contiguous stretch
 * where points are inside ISSR. Single-point stretches are discarded.
 */
export function buildIssrSegments(track: TrackPoint[]): GeoJSON.Feature[] {
  const features: GeoJSON.Feature[] = [];
  let segment: [number, number][] = [];

  for (const point of track) {
    if (point.in_issr) {
      segment.push([point.lon, point.lat]);
      continue;
    }
    if (segment.length > 1) {
      features.push(toLineFeature(segment));
    }
    segment = [];
  }

  if (segment.length > 1) features.push(toLineFeature(segment));
  return features;
}

function toLineFeature(coords: [number, number][]): GeoJSON.Feature {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates: coords },
  };
}
