"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { AIRPORT_COORDS } from "@/lib/utils/airports";
import { interpolateGreatCircle } from "@/lib/utils/geo";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

const ANIM_DURATION_MS = 3000;
const WAYPOINT_COUNT = 120;

export interface PlaygroundMapHandle {
  showRoute: (origin: string, destination: string, date: string, departureHour?: number) => void;
  setProgress: (hour: number) => void;
  updateRouteRisk: (probability: number) => void;
  setLayer: (layer: string | null) => void;
  clear: () => void;
}

interface Props {
  /** Called each animation frame with the estimated clock hour so the slider stays in sync. */
  onProgress?: (hour: number) => void;
}

interface RouteState {
  coords: [number, number][];
  departureHour: number;
  flightHours: number;
}

// Top-down airplane silhouette — nose points toward y=0 (north at bearing 0)
const PLANE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <path d="M32 4 L29 12 L29 28 L4 40 L4 44 L29 36 L29 47 L22 52 L22 55 L32 53 L42 55 L42 52 L35 47 L35 36 L60 44 L60 40 L35 28 L35 12 Z" fill="white" opacity="0.95"/>
</svg>`;

function getBearing(a: [number, number], b: [number, number]): number {
  const dLon = ((b[0] - a[0]) * Math.PI) / 180;
  const lat1 = (a[1] * Math.PI) / 180;
  const lat2 = (b[1] * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function estimateFlightHours(origin: [number, number], dest: [number, number]): number {
  const R = 6371;
  const lat1 = (origin[1] * Math.PI) / 180;
  const lat2 = (dest[1] * Math.PI) / 180;
  const dLat = ((dest[1] - origin[1]) * Math.PI) / 180;
  const dLon = ((dest[0] - origin[0]) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.max(1, (2 * R * Math.asin(Math.sqrt(a))) / 850);
}

function getRiskGradient(p: number): [string, string] {
  if (p < 0.3) return ["#2dd4bf", "#22c55e"];
  if (p < 0.6) return ["#22c55e", "#eab308"];
  return ["#eab308", "#ef4444"];
}

function getRiskLabel(p: number): { label: string; color: string; desc: string } {
  if (p < 0.3) return { label: "Low",    color: "#2dd4bf", desc: "Favorable conditions along most of this route." };
  if (p < 0.6) return { label: "Medium", color: "#eab308", desc: "Moderate contrail risk along portions of this route." };
  return          { label: "High",   color: "#ef4444", desc: "High contrail formation likely along this route." };
}

function buildPopupHTML(probability: number): string {
  const { label, color, desc } = getRiskLabel(probability);
  const pct = Math.round(probability * 100);
  return `
    <div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <span style="font-size:16px;">${label === "Low" ? "🌿" : label === "Medium" ? "⚠️" : "🔴"}</span>
        <span style="font-weight:600;font-size:13px;">${label} Contrail Formation</span>
      </div>
      <p style="font-size:11px;color:rgba(255,255,255,0.6);margin:0 0 10px;">${desc}</p>
      <div style="height:4px;border-radius:2px;background:rgba(255,255,255,0.1);margin-bottom:8px;overflow:hidden;">
        <div style="width:${pct}%;height:100%;border-radius:2px;background:${color};"></div>
      </div>
      <div style="font-size:11px;font-weight:600;color:${color};">Contrail Risk: ${label}</div>
    </div>
  `;
}

const POPUP_STYLES = `
  .sp-popup .mapboxgl-popup-content {
    background: rgba(7,12,24,0.85);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 12px;
    padding: 14px 16px;
    color: white;
    font-family: inherit;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  }
  .sp-popup .mapboxgl-popup-tip { display: none; }
  .sp-popup .mapboxgl-popup-close-button { display: none; }
`;

const PlaygroundMap = forwardRef<PlaygroundMapHandle, Props>(function PlaygroundMap({ onProgress }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const loadedRef = useRef(false);
  const planeReadyRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const sessionRef = useRef(0);          // increments on every showRoute call
  const midpointRef = useRef<[number, number] | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const routeRef = useRef<RouteState | null>(null);
  const onProgressRef = useRef(onProgress);
  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);

  function setPlaneVisible(map: mapboxgl.Map, visible: boolean) {
    if (!planeReadyRef.current) return;
    map.setLayoutProperty("aircraft-symbol", "visibility", visible ? "visible" : "none");
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !TOKEN) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [-30, 50],
      zoom: 2,
      projection: "globe",
      accessToken: TOKEN,
      attributionControl: false,
      antialias: true,
    });

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      map.setFog({
        color: "rgb(186, 210, 235)",
        "high-color": "#245bde",
        "space-color": "#000000",
        "horizon-blend": 0.02,
        "star-intensity": 0.15,
      });

      map.addLayer({
        id: "sky",
        type: "sky",
        paint: {
          "sky-type": "atmosphere",
          "sky-atmosphere-sun": [0.0, 0.0],
          "sky-atmosphere-sun-intensity": 15,
        },
      });

      // Route line
      map.addSource("route", {
        type: "geojson",
        lineMetrics: true,
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
      });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-width": 3,
          "line-opacity": 1,
          "line-gradient": ["interpolate", ["linear"], ["line-progress"], 0, "#2dd4bf", 1, "#22c55e"],
        },
        layout: { "line-cap": "round", "line-join": "round" },
      });

      // Aircraft source (symbol layer added after image loads)
      map.addSource("aircraft", {
        type: "geojson",
        data: { type: "Feature", properties: { bearing: 0 }, geometry: { type: "Point", coordinates: [0, 0] } },
      });

      // Endpoint dots
      map.addSource("endpoints", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "endpoint-dots",
        type: "circle",
        source: "endpoints",
        paint: {
          "circle-radius": 6,
          "circle-color": "#2dd4bf",
          "circle-opacity": 0.9,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      loadedRef.current = true;

      // Load SVG plane icon async — adds symbol layer when ready
      const planeImg = new window.Image(64, 64);
      planeImg.onload = () => {
        if (!mapRef.current) return;
        if (!map.hasImage("plane-icon")) map.addImage("plane-icon", planeImg);
        map.addLayer({
          id: "aircraft-symbol",
          type: "symbol",
          source: "aircraft",
          layout: {
            "icon-image": "plane-icon",
            "icon-size": 0.5,
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
            "visibility": "none",
          },
        });
        planeReadyRef.current = true;
      };
      planeImg.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(PLANE_SVG)}`;
    });

    mapRef.current = map;
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
      planeReadyRef.current = false;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    showRoute(origin, destination, date, departureHour = 10) {
      const map = mapRef.current;
      if (!map || !loadedRef.current) return;

      // Bump session — any in-flight animation from a previous call will see a
      // stale session ID and bail immediately, fixing the destination-jump glitch.
      const session = ++sessionRef.current;

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
      popupRef.current?.remove();
      popupRef.current = null;
      midpointRef.current = null;
      routeRef.current = null;

      const originCoords = AIRPORT_COORDS[origin];
      const destCoords   = AIRPORT_COORDS[destination];
      const oCoord: [number, number] = originCoords ? [originCoords.longitude, originCoords.latitude] : [-73.78, 40.64];
      const dCoord: [number, number] = destCoords   ? [destCoords.longitude,   destCoords.latitude]   : [-0.45,  51.47];

      (map.getSource("endpoints") as mapboxgl.GeoJSONSource)?.setData({
        type: "FeatureCollection",
        features: [
          { type: "Feature", properties: { label: origin },      geometry: { type: "Point", coordinates: oCoord } },
          { type: "Feature", properties: { label: destination }, geometry: { type: "Point", coordinates: dCoord } },
        ],
      });

      map.setPaintProperty("route-line", "line-gradient", ["interpolate", ["linear"], ["line-progress"], 0, "#2dd4bf", 1, "#22c55e"]);
      (map.getSource("route") as mapboxgl.GeoJSONSource)?.setData(
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } }
      );

      const bounds = new mapboxgl.LngLatBounds(oCoord, oCoord);
      bounds.extend(dCoord);
      map.fitBounds(bounds, { padding: 120, maxZoom: 5, duration: 1000 });

      const hh = String(Math.floor(departureHour)).padStart(2, "0");
      const mm = String(Math.round((departureHour % 1) * 60)).padStart(2, "0");
      const waypoints = interpolateGreatCircle(
        { latitude: oCoord[1], longitude: oCoord[0] },
        { latitude: dCoord[1], longitude: dCoord[0] },
        WAYPOINT_COUNT,
        35000,
        new Date(`${date}T${hh}:${mm}:00Z`).toISOString()
      );
      const coords: [number, number][] = waypoints.map((wp) => [wp.longitude, wp.latitude]);

      midpointRef.current = coords[Math.floor(coords.length / 2)] ?? null;
      routeRef.current = { coords, departureHour, flightHours: estimateFlightHours(oCoord, dCoord) };

      const routeSource   = map.getSource("route")    as mapboxgl.GeoJSONSource;
      const aircraftSource = map.getSource("aircraft") as mapboxgl.GeoJSONSource;

      setPlaneVisible(map, true);

      // Timestamp-based animation — smooth regardless of frame rate
      let startTime: number | null = null;
      const { departureHour: depH, flightHours: flightH } = routeRef.current!;

      const animate = (timestamp: number) => {
        // Guard: if a newer showRoute call happened, stop this animation
        if (sessionRef.current !== session) return;

        if (startTime === null) startTime = timestamp;
        const progress = Math.min(1, (timestamp - startTime) / ANIM_DURATION_MS);
        const idx = Math.min(coords.length - 1, Math.floor(progress * coords.length));

        // Keep the slider in sync with the animation
        onProgressRef.current?.(depH + progress * flightH);

        routeSource?.setData({
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: coords.slice(0, idx + 1) },
        });

        const cur  = coords[idx];
        const prev = coords[Math.max(0, idx - 1)];
        aircraftSource?.setData({
          type: "Feature",
          properties: { bearing: getBearing(prev, cur) },
          geometry: { type: "Point", coordinates: cur },
        });

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          setPlaneVisible(map, false);
          animFrameRef.current = null;
        }
      };

      // Wait for camera move to finish before starting
      setTimeout(() => {
        if (sessionRef.current !== session) return;
        animFrameRef.current = requestAnimationFrame(animate);
      }, 1100);
    },

    setProgress(hour) {
      const map = mapRef.current;
      const route = routeRef.current;
      if (!map || !loadedRef.current || !route) return;

      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }

      const { coords, departureHour, flightHours } = route;
      const progress = Math.max(0, Math.min(1, (hour - departureHour) / flightHours));
      const idx = Math.round(progress * (coords.length - 1));

      (map.getSource("route") as mapboxgl.GeoJSONSource)?.setData({
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: coords.slice(0, idx + 1) },
      });

      const inFlight = progress > 0 && progress < 1;
      setPlaneVisible(map, inFlight);
      if (inFlight) {
        const cur  = coords[idx];
        const prev = coords[Math.max(0, idx - 1)];
        (map.getSource("aircraft") as mapboxgl.GeoJSONSource)?.setData({
          type: "Feature",
          properties: { bearing: getBearing(prev, cur) },
          geometry: { type: "Point", coordinates: cur },
        });
      }
    },

    updateRouteRisk(probability) {
      const map = mapRef.current;
      if (!map || !loadedRef.current) return;

      const [start, end] = getRiskGradient(probability);
      map.setPaintProperty("route-line", "line-gradient", ["interpolate", ["linear"], ["line-progress"], 0, start, 1, end]);
      map.setPaintProperty("endpoint-dots", "circle-color", start);

      popupRef.current?.remove();
      if (midpointRef.current) {
        popupRef.current = new mapboxgl.Popup({ className: "sp-popup", closeButton: false, maxWidth: "240px", offset: 12 })
          .setLngLat(midpointRef.current)
          .setHTML(buildPopupHTML(probability))
          .addTo(map);
      }
    },

    setLayer(_layer) {
      // Stub — weather layer toggle wired up when OWM key is added
    },

    clear() {
      const map = mapRef.current;
      if (!map || !loadedRef.current) return;
      sessionRef.current++;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
      popupRef.current?.remove();
      popupRef.current = null;
      midpointRef.current = null;
      routeRef.current = null;
      setPlaneVisible(map, false);
      (map.getSource("route") as mapboxgl.GeoJSONSource)?.setData(
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } }
      );
      (map.getSource("endpoints") as mapboxgl.GeoJSONSource)?.setData(
        { type: "FeatureCollection", features: [] }
      );
    },
  }));

  return (
    <>
      <style>{POPUP_STYLES}</style>
      <div ref={containerRef} className="w-full h-full" />
    </>
  );
});

export default PlaygroundMap;
