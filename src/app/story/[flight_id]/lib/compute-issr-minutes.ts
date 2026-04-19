import type { TrackPoint } from "./types";

/**
 * Sum milliseconds between consecutive track points where both are in_issr,
 * then convert to whole minutes.
 */
export function computeISSRMinutes(track: TrackPoint[]): number {
  let totalMs = 0;
  for (let i = 1; i < track.length; i++) {
    if (track[i].in_issr && track[i - 1].in_issr) {
      const t1 = new Date(track[i - 1].t).getTime();
      const t2 = new Date(track[i].t).getTime();
      totalMs += Math.abs(t2 - t1);
    }
  }
  return Math.round(totalMs / 60000);
}
