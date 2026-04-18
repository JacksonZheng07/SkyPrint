import type { TrackPoint } from "./types";

/**
 * Douglas-Peucker polyline simplification.
 *
 * Applied when track has >2000 points to keep Mapbox performant.
 * Epsilon = 0.01 degrees (~1.1 km at mid-latitudes).
 * This is a geographic simplification — time-series properties are preserved
 * for the retained points but intermediate points are dropped.
 */
const DEFAULT_EPSILON = 0.01; // degrees

function perpendicularDistance(
  point: [number, number],
  lineStart: [number, number],
  lineEnd: [number, number]
): number {
  const dx = lineEnd[0] - lineStart[0];
  const dy = lineEnd[1] - lineStart[1];
  const mag = Math.sqrt(dx * dx + dy * dy);
  if (mag === 0) {
    const ex = point[0] - lineStart[0];
    const ey = point[1] - lineStart[1];
    return Math.sqrt(ex * ex + ey * ey);
  }
  const u =
    ((point[0] - lineStart[0]) * dx + (point[1] - lineStart[1]) * dy) /
    (mag * mag);
  const closestX = lineStart[0] + u * dx;
  const closestY = lineStart[1] + u * dy;
  return Math.sqrt(
    (point[0] - closestX) ** 2 + (point[1] - closestY) ** 2
  );
}

function douglasPeuckerIndices(
  points: [number, number][],
  epsilon: number,
  startIdx: number,
  endIdx: number,
  keep: Set<number>
): void {
  if (endIdx - startIdx < 2) return;

  let maxDist = 0;
  let maxIdx = startIdx;

  for (let i = startIdx + 1; i < endIdx; i++) {
    const d = perpendicularDistance(
      points[i],
      points[startIdx],
      points[endIdx]
    );
    if (d > maxDist) {
      maxDist = d;
      maxIdx = i;
    }
  }

  if (maxDist > epsilon) {
    keep.add(maxIdx);
    douglasPeuckerIndices(points, epsilon, startIdx, maxIdx, keep);
    douglasPeuckerIndices(points, epsilon, maxIdx, endIdx, keep);
  }
}

export function simplifyTrack(
  track: TrackPoint[],
  epsilon: number = DEFAULT_EPSILON
): TrackPoint[] {
  if (track.length <= 2000) return track;

  const coords: [number, number][] = track.map((p) => [p.lon, p.lat]);
  const keep = new Set<number>([0, track.length - 1]);
  douglasPeuckerIndices(coords, epsilon, 0, track.length - 1, keep);

  const sorted = Array.from(keep).sort((a, b) => a - b);
  return sorted.map((i) => track[i]);
}
