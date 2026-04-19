"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { AIRPORT_COORDS } from "@/lib/utils/airports";
import { interpolateGreatCircle } from "@/lib/utils/geo";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export interface PlaygroundMapHandle {
  showRoute: (origin: string, destination: string, date: string) => void;
  clear: () => void;
}

function getBearing(a: [number, number], b: [number, number]): number {
  const dLon = ((b[0] - a[0]) * Math.PI) / 180;
  const lat1 = (a[1] * Math.PI) / 180;
  const lat2 = (b[1] * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

const PlaygroundMap = forwardRef<PlaygroundMapHandle>(function PlaygroundMap(_, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const loadedRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !TOKEN) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-30, 50],
      zoom: 2.8,
      accessToken: TOKEN,
      attributionControl: false,
      antialias: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      // Route line source + layer
      map.addSource("route", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
      });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: { "line-color": "#38bdf8", "line-width": 2.5, "line-opacity": 0.9 },
        layout: { "line-cap": "round", "line-join": "round" },
      });

      // Aircraft dot
      map.addSource("aircraft", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [0, 0] } },
      });
      map.addLayer({
        id: "aircraft-dot",
        type: "circle",
        source: "aircraft",
        paint: {
          "circle-radius": 5,
          "circle-color": "#ffffff",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#38bdf8",
          "circle-opacity": 0,
        },
      });

      // Origin / destination markers
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
          "circle-color": "#38bdf8",
          "circle-opacity": 0.9,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      loadedRef.current = true;
    });

    mapRef.current = map;
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    showRoute(origin, destination, date) {
      const map = mapRef.current;
      if (!map || !loadedRef.current) return;

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      const originCoords = AIRPORT_COORDS[origin];
      const destCoords = AIRPORT_COORDS[destination];

      const oCoord: [number, number] = originCoords
        ? [originCoords.longitude, originCoords.latitude]
        : [-73.78, 40.64]; // JFK fallback
      const dCoord: [number, number] = destCoords
        ? [destCoords.longitude, destCoords.latitude]
        : [-0.45, 51.47]; // LHR fallback

      // Show endpoint markers immediately
      const endpointSource = map.getSource("endpoints") as mapboxgl.GeoJSONSource;
      endpointSource?.setData({
        type: "FeatureCollection",
        features: [
          { type: "Feature", properties: { label: origin }, geometry: { type: "Point", coordinates: oCoord } },
          { type: "Feature", properties: { label: destination }, geometry: { type: "Point", coordinates: dCoord } },
        ],
      });

      // Reset route
      const routeSource = map.getSource("route") as mapboxgl.GeoJSONSource;
      routeSource?.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } });

      // Fit bounds to show full route
      const bounds = new mapboxgl.LngLatBounds(oCoord, oCoord);
      bounds.extend(dCoord);
      map.fitBounds(bounds, { padding: 120, maxZoom: 5, duration: 1000 });

      // Build great-circle waypoints
      const departureTime = new Date(`${date}T10:00:00Z`).toISOString();
      const waypoints = interpolateGreatCircle(
        { latitude: oCoord[1], longitude: oCoord[0] },
        { latitude: dCoord[1], longitude: dCoord[0] },
        60,
        35000,
        departureTime
      );
      const coords: [number, number][] = waypoints.map((wp) => [wp.longitude, wp.latitude]);

      // Animate route drawing after camera move
      let frameIndex = 0;
      const framesPerStep = Math.max(1, Math.floor(900 / coords.length));
      let stepCount = 0;

      map.setPaintProperty("aircraft-dot", "circle-opacity", 1);

      const animate = () => {
        if (frameIndex >= coords.length) {
          map.setPaintProperty("aircraft-dot", "circle-opacity", 0);
          return;
        }

        stepCount++;
        if (stepCount % framesPerStep !== 0 && frameIndex > 0) {
          animFrameRef.current = requestAnimationFrame(animate);
          return;
        }

        routeSource?.setData({
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: coords.slice(0, frameIndex + 1) },
        });

        const aircraftSource = map.getSource("aircraft") as mapboxgl.GeoJSONSource;
        const cur = coords[frameIndex];
        const prev = frameIndex > 0 ? coords[frameIndex - 1] : cur;
        aircraftSource?.setData({
          type: "Feature",
          properties: { bearing: getBearing(prev, cur) },
          geometry: { type: "Point", coordinates: cur },
        });

        frameIndex++;
        animFrameRef.current = requestAnimationFrame(animate);
      };

      setTimeout(() => { animFrameRef.current = requestAnimationFrame(animate); }, 1100);
    },

    clear() {
      const map = mapRef.current;
      if (!map || !loadedRef.current) return;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      (map.getSource("route") as mapboxgl.GeoJSONSource)?.setData(
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } }
      );
      (map.getSource("endpoints") as mapboxgl.GeoJSONSource)?.setData(
        { type: "FeatureCollection", features: [] }
      );
      map.setPaintProperty("aircraft-dot", "circle-opacity", 0);
    },
  }));

  return <div ref={containerRef} className="w-full h-full" />;
});

export default PlaygroundMap;
