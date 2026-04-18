"use client";

import { useCallback, useRef } from "react";
import type mapboxgl from "mapbox-gl";
import type { TrackPoint } from "../lib/types";

interface AnimationState {
  animating: boolean;
  frameIndex: number;
  rafId: number | null;
}

/**
 * Manages the track-drawing animation and camera follow for Scene 1.
 * The track is drawn progressively by updating a GeoJSON source
 * with a growing slice of coordinates.
 */
export function useMapAnimation() {
  const stateRef = useRef<AnimationState>({
    animating: false,
    frameIndex: 0,
    rafId: null,
  });

  /**
   * Animate the track drawing from origin to destination.
   * Camera follows the aircraft icon along the route at ~10x real-time.
   */
  const animateTrack = useCallback(
    (
      map: mapboxgl.Map,
      track: TrackPoint[],
      onComplete?: () => void
    ) => {
      if (stateRef.current.animating) return;

      const coords = track.map((p) => [p.lon, p.lat] as [number, number]);
      // Target ~15 seconds for the full animation
      const framesPerStep = Math.max(1, Math.floor(900 / coords.length));

      stateRef.current = { animating: true, frameIndex: 0, rafId: null };

      // Start camera at origin
      map.easeTo({
        center: coords[0],
        zoom: 7,
        duration: 1000,
      });

      let stepCounter = 0;

      const step = () => {
        const { frameIndex } = stateRef.current;
        if (frameIndex >= coords.length) {
          stateRef.current.animating = false;
          // Final camera ease to destination
          map.easeTo({
            center: coords[coords.length - 1],
            zoom: 7,
            duration: 1500,
          });
          onComplete?.();
          return;
        }

        stepCounter++;
        if (stepCounter % framesPerStep !== 0 && frameIndex > 0) {
          stateRef.current.rafId = requestAnimationFrame(step);
          return;
        }

        // Update track line with growing coordinates
        const source = map.getSource("track-actual") as mapboxgl.GeoJSONSource | undefined;
        if (source) {
          source.setData({
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: coords.slice(0, frameIndex + 1),
            },
          });
        }

        // Update aircraft position marker
        const aircraftSource = map.getSource("aircraft-position") as mapboxgl.GeoJSONSource | undefined;
        if (aircraftSource) {
          const current = coords[frameIndex];
          const prev = frameIndex > 0 ? coords[frameIndex - 1] : current;
          const bearing = getBearing(prev, current);
          aircraftSource.setData({
            type: "Feature",
            properties: { bearing },
            geometry: {
              type: "Point",
              coordinates: current,
            },
          });
        }

        // Follow camera — smooth ease every few frames
        if (frameIndex % 3 === 0) {
          const zoomProgress = frameIndex / coords.length;
          const zoom = zoomProgress < 0.1 ? 6
            : zoomProgress > 0.9 ? 6
            : 4;
          map.easeTo({
            center: coords[frameIndex],
            zoom,
            duration: 300,
            easing: (t) => t,
          });
        }

        stateRef.current.frameIndex = frameIndex + 1;
        stateRef.current.rafId = requestAnimationFrame(step);
      };

      // Begin after initial camera move
      setTimeout(() => {
        stateRef.current.rafId = requestAnimationFrame(step);
      }, 1200);
    },
    []
  );

  const stopAnimation = useCallback(() => {
    if (stateRef.current.rafId !== null) {
      cancelAnimationFrame(stateRef.current.rafId);
    }
    stateRef.current.animating = false;
  }, []);

  return { animateTrack, stopAnimation };
}

function getBearing(
  start: [number, number],
  end: [number, number]
): number {
  const dLon = ((end[0] - start[0]) * Math.PI) / 180;
  const lat1 = (start[1] * Math.PI) / 180;
  const lat2 = (end[1] * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}
