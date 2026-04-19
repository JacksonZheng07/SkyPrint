"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { SceneName } from "../hooks/useScrollama";
import type { TrackPoint } from "../lib/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

// Color constants per spec
const COLOR_TRACK_NEUTRAL = "#888888";
const COLOR_TRACK_ISSR = "#FF4444";
const COLOR_COUNTERFACTUAL = "#00E5CC";
const COLOR_ISSR_FILL = "#F59E0B";

export interface FlightMapHandle {
  getMap: () => mapboxgl.Map | null;
  /** Show the full drawn track (post-animation) with ISSR coloring */
  showFullTrack: (track: TrackPoint[]) => void;
  /** Show the ISSR overlay with opacity animation */
  showISSR: (geojson: GeoJSON.FeatureCollection) => void;
  /** Show the counterfactual track */
  showCounterfactual: (track: TrackPoint[]) => void;
  /** Load counterfactual data into the source without changing visibility */
  preloadCounterfactual: (track: TrackPoint[]) => void;
  /** Toggle between actual and counterfactual */
  setCounterfactualVisible: (visible: boolean) => void;
  /** Update map layout for scene transitions */
  updateForScene: (scene: SceneName) => void;
}

interface FlightMapProps {
  className?: string;
}

const FlightMap = forwardRef<FlightMapHandle, FlightMapProps>(
  function FlightMap({ className = "" }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const loadedRef = useRef(false);

    useEffect(() => {
      if (!containerRef.current || mapRef.current) return;
      if (!MAPBOX_TOKEN) {
        console.error(
          "[FlightMap] NEXT_PUBLIC_MAPBOX_TOKEN is not set. Add it to .env.local"
        );
        return;
      }

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-30, 50],
        zoom: 3,
        accessToken: MAPBOX_TOKEN,
        attributionControl: false,
        antialias: true,
      });

      map.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        "bottom-right"
      );

      map.on("load", () => {
        loadedRef.current = true;

        // Pre-register empty GeoJSON sources
        map.addSource("track-actual", {
          type: "geojson",
          data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
        });
        map.addSource("track-actual-issr", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addSource("track-counterfactual", {
          type: "geojson",
          data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
        });
        map.addSource("issr-overlay", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addSource("aircraft-position", {
          type: "geojson",
          data: { type: "Feature", properties: { bearing: 0 }, geometry: { type: "Point", coordinates: [0, 0] } },
        });

        // ISSR fill layer
        map.addLayer({
          id: "issr-fill",
          type: "fill",
          source: "issr-overlay",
          paint: {
            "fill-color": COLOR_ISSR_FILL,
            "fill-opacity": 0,
          },
        });

        // Actual track line (neutral)
        map.addLayer({
          id: "track-actual-line",
          type: "line",
          source: "track-actual",
          paint: {
            "line-color": COLOR_TRACK_NEUTRAL,
            "line-width": 2.5,
            "line-opacity": 1,
          },
          layout: { "line-cap": "round", "line-join": "round" },
        });

        // ISSR-colored track segments (overlaid)
        map.addLayer({
          id: "track-actual-issr-line",
          type: "line",
          source: "track-actual-issr",
          paint: {
            "line-color": COLOR_TRACK_ISSR,
            "line-width": 3,
            "line-opacity": 0,
          },
          layout: { "line-cap": "round", "line-join": "round" },
        });

        // Counterfactual track
        map.addLayer({
          id: "track-counterfactual-line",
          type: "line",
          source: "track-counterfactual",
          paint: {
            "line-color": COLOR_COUNTERFACTUAL,
            "line-width": 2.5,
            "line-opacity": 0,
          },
          layout: {
            "line-cap": "round",
            "line-join": "round",
            visibility: "none",
          },
        });

        // Aircraft icon (simple circle)
        map.addLayer({
          id: "aircraft-dot",
          type: "circle",
          source: "aircraft-position",
          paint: {
            "circle-radius": 5,
            "circle-color": "#ffffff",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
            "circle-opacity": 1,
          },
        });

        // --- Hover popups ---
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 12,
        });

        map.on("mousemove", "track-actual-issr-line", (e) => {
          if (!e.features?.[0]) return;
          map.getCanvas().style.cursor = "pointer";
          const p = e.features[0].properties as {
            avg_alt_ft?: number;
            total_forcing_j_m?: number;
          } | null;
          popup
            .setLngLat(e.lngLat)
            .setHTML(
              `<div style="font-family:system-ui,sans-serif;font-size:12px;color:#111;min-width:180px;">
                <div style="color:${COLOR_TRACK_ISSR};font-weight:600;margin-bottom:4px;">Contrail-forming region</div>
                <div>Altitude: ${p?.avg_alt_ft ?? "—"} ft</div>
                <div>Forcing: ${p?.total_forcing_j_m ?? "—"} J/m</div>
              </div>`
            )
            .addTo(map);
        });
        map.on("mouseleave", "track-actual-issr-line", () => {
          map.getCanvas().style.cursor = "";
          popup.remove();
        });

        map.on("mousemove", "track-counterfactual-line", (e) => {
          if (!e.features?.[0]) return;
          map.getCanvas().style.cursor = "pointer";
          const p = e.features[0].properties as {
            min_alt_ft?: number;
            max_alt_ft?: number;
          } | null;
          popup
            .setLngLat(e.lngLat)
            .setHTML(
              `<div style="font-family:system-ui,sans-serif;font-size:12px;color:#111;min-width:180px;">
                <div style="color:#008876;font-weight:600;margin-bottom:4px;">Alternative route</div>
                <div>Altitude: ${p?.min_alt_ft ?? "—"}–${p?.max_alt_ft ?? "—"} ft</div>
                <div style="color:#555;">Avoids ISSR conditions</div>
              </div>`
            )
            .addTo(map);
        });
        map.on("mouseleave", "track-counterfactual-line", () => {
          map.getCanvas().style.cursor = "";
          popup.remove();
        });
      });

      mapRef.current = map;

      return () => {
        map.remove();
        mapRef.current = null;
        loadedRef.current = false;
      };
    }, []);

    useImperativeHandle(ref, () => ({
      getMap: () => mapRef.current,

      showFullTrack: (track: TrackPoint[]) => {
        const map = mapRef.current;
        if (!map || !loadedRef.current) return;

        const coords = track.map((p) => [p.lon, p.lat] as [number, number]);
        const source = map.getSource("track-actual") as mapboxgl.GeoJSONSource;
        source?.setData({
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: coords },
        });

        // Build ISSR segments as separate line features with summary properties
        const issrFeatures: GeoJSON.Feature[] = [];
        let segCoords: [number, number][] = [];
        let segPoints: TrackPoint[] = [];
        const flushSegment = () => {
          if (segCoords.length > 1) {
            const avgAlt = Math.round(
              segPoints.reduce((s, p) => s + p.alt_ft, 0) / segPoints.length
            );
            const totalForcing = Math.round(
              segPoints.reduce((s, p) => s + (p.segment_forcing_j_m || 0), 0)
            );
            issrFeatures.push({
              type: "Feature",
              properties: {
                avg_alt_ft: avgAlt,
                total_forcing_j_m: totalForcing,
              },
              geometry: { type: "LineString", coordinates: segCoords },
            });
          }
          segCoords = [];
          segPoints = [];
        };
        for (let i = 0; i < track.length; i++) {
          if (track[i].in_issr) {
            segCoords.push([track[i].lon, track[i].lat]);
            segPoints.push(track[i]);
          } else {
            flushSegment();
          }
        }
        flushSegment();

        const issrSource = map.getSource("track-actual-issr") as mapboxgl.GeoJSONSource;
        issrSource?.setData({ type: "FeatureCollection", features: issrFeatures });

        // Hide aircraft dot
        map.setPaintProperty("aircraft-dot", "circle-opacity", 0);
      },

      showISSR: (geojson: GeoJSON.FeatureCollection) => {
        const map = mapRef.current;
        if (!map || !loadedRef.current) return;

        const source = map.getSource("issr-overlay") as mapboxgl.GeoJSONSource;
        source?.setData(geojson);

        // Animate opacity in
        map.setPaintProperty("issr-fill", "fill-opacity", 0.55);
        // Show ISSR track coloring
        map.setPaintProperty("track-actual-issr-line", "line-opacity", 1);
        // Dim non-ISSR track
        map.setPaintProperty("track-actual-line", "line-opacity", 0.4);

        // Camera to mid-Atlantic overview
        map.easeTo({ center: [-35, 48], zoom: 3.2, duration: 800 });
      },

      showCounterfactual: (track: TrackPoint[]) => {
        const map = mapRef.current;
        if (!map || !loadedRef.current) return;

        const coords = track.map((p) => [p.lon, p.lat] as [number, number]);
        const alts = track.map((p) => p.alt_ft);
        const source = map.getSource("track-counterfactual") as mapboxgl.GeoJSONSource;
        source?.setData({
          type: "Feature",
          properties: {
            min_alt_ft: alts.length ? Math.min(...alts) : 0,
            max_alt_ft: alts.length ? Math.max(...alts) : 0,
          },
          geometry: { type: "LineString", coordinates: coords },
        });
        map.setLayoutProperty("track-counterfactual-line", "visibility", "visible");
        map.setPaintProperty("track-counterfactual-line", "line-opacity", 1);
        // Dim the actual track
        map.setPaintProperty("track-actual-line", "line-opacity", 0.3);
        map.setPaintProperty("track-actual-issr-line", "line-opacity", 0.3);
      },

      preloadCounterfactual: (track: TrackPoint[]) => {
        const map = mapRef.current;
        if (!map || !loadedRef.current) return;
        const coords = track.map((p) => [p.lon, p.lat] as [number, number]);
        const alts = track.map((p) => p.alt_ft);
        const source = map.getSource("track-counterfactual") as mapboxgl.GeoJSONSource;
        source?.setData({
          type: "Feature",
          properties: {
            min_alt_ft: alts.length ? Math.min(...alts) : 0,
            max_alt_ft: alts.length ? Math.max(...alts) : 0,
          },
          geometry: { type: "LineString", coordinates: coords },
        });
        // Do NOT change visibility or opacity — caller controls
      },

      setCounterfactualVisible: (visible: boolean) => {
        const map = mapRef.current;
        if (!map || !loadedRef.current) return;
        map.setLayoutProperty(
          "track-counterfactual-line",
          "visibility",
          visible ? "visible" : "none"
        );
        map.setPaintProperty(
          "track-actual-line",
          "line-opacity",
          visible ? 0.3 : 1
        );
      },

      updateForScene: (scene: SceneName) => {
        const map = mapRef.current;
        if (!map || !loadedRef.current) return;

        if (scene === "flight") {
          map.setPaintProperty("issr-fill", "fill-opacity", 0);
          map.setPaintProperty("track-actual-line", "line-opacity", 1);
          map.setPaintProperty("track-actual-issr-line", "line-opacity", 0);
          map.setLayoutProperty("track-counterfactual-line", "visibility", "none");
        } else if (scene === "issr") {
          map.setPaintProperty("track-actual-line", "line-opacity", 0.4);
          map.setPaintProperty("track-actual-issr-line", "line-opacity", 1);
          map.setPaintProperty("issr-fill", "fill-opacity", 0.55);
          map.setLayoutProperty("track-counterfactual-line", "visibility", "none");
        } else if (scene === "receipt") {
          // Keep ISSR state, no further changes
          map.setLayoutProperty("track-counterfactual-line", "visibility", "none");
        } else if (scene === "counterfactual") {
          map.setLayoutProperty("track-counterfactual-line", "visibility", "visible");
          map.setPaintProperty("track-counterfactual-line", "line-opacity", 1);
          map.setPaintProperty("track-actual-line", "line-opacity", 0.3);
          map.setPaintProperty("track-actual-issr-line", "line-opacity", 0.3);
        } else if (scene === "context") {
          // Fade map
          // (opacity handled via CSS on the container)
        }

        // Trigger resize after potential layout change
        setTimeout(() => map.resize(), 100);
      },
    }));

    return (
      <div
        ref={containerRef}
        className={`w-full h-full ${className}`}
        style={{ minHeight: "100vh" }}
      />
    );
  }
);

export default FlightMap;
