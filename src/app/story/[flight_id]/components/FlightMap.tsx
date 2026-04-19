"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { SceneName } from "../hooks/useScrollama";
import type { TrackPoint } from "../lib/types";
import { MAP_LAYERS, MAP_SOURCES } from "../lib/map-constants";
import { registerMapLayers, registerMapSources } from "../lib/map-setup";
import { buildIssrSegments } from "../lib/build-issr-segments";
import { MAP_SCENE_HANDLERS } from "../lib/map-scene-handlers";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export interface FlightMapHandle {
  getMap: () => mapboxgl.Map | null;
  showFullTrack: (track: TrackPoint[]) => void;
  showISSR: (geojson: GeoJSON.FeatureCollection) => void;
  showCounterfactual: (track: TrackPoint[]) => void;
  /** Load counterfactual data into the source without changing visibility */
  preloadCounterfactual: (track: TrackPoint[]) => void;
  setCounterfactualVisible: (visible: boolean) => void;
  updateForScene: (scene: SceneName) => void;
}

interface FlightMapProps {
  className?: string;
}

function trackToLineFeature(track: TrackPoint[]): GeoJSON.Feature {
  const coordinates = track.map((p) => [p.lon, p.lat] as [number, number]);
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates },
  };
}

function counterfactualFeature(track: TrackPoint[]): GeoJSON.Feature {
  const coordinates = track.map((p) => [p.lon, p.lat] as [number, number]);
  const alts = track.map((p) => p.alt_ft);
  return {
    type: "Feature",
    properties: {
      min_alt_ft: alts.length ? Math.min(...alts) : 0,
      max_alt_ft: alts.length ? Math.max(...alts) : 0,
    },
    geometry: { type: "LineString", coordinates },
  };
}

function setSourceData(
  map: mapboxgl.Map,
  sourceId: string,
  data: GeoJSON.Feature | GeoJSON.FeatureCollection,
): void {
  const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined;
  source?.setData(data);
}

const FlightMap = forwardRef<FlightMapHandle, FlightMapProps>(function FlightMap(
  { className = "" },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!MAPBOX_TOKEN) {
      console.error("[FlightMap] NEXT_PUBLIC_MAPBOX_TOKEN is not set. Add it to .env.local");
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

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      registerMapSources(map);
      registerMapLayers(map);
      loadedRef.current = true;
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

    showFullTrack: (track) => {
      const map = mapRef.current;
      if (!map || !loadedRef.current) return;
      setSourceData(map, MAP_SOURCES.trackActual, trackToLineFeature(track));
      setSourceData(map, MAP_SOURCES.trackActualIssr, {
        type: "FeatureCollection",
        features: buildIssrSegments(track),
      });
      map.setPaintProperty(MAP_LAYERS.aircraftDot, "circle-opacity", 0);
    },

    showISSR: (geojson) => {
      const map = mapRef.current;
      if (!map || !loadedRef.current) return;
      setSourceData(map, MAP_SOURCES.issrOverlay, geojson);
      map.setPaintProperty(MAP_LAYERS.issrFill, "fill-opacity", 0.45);
      map.setPaintProperty(MAP_LAYERS.issrEdge, "line-opacity", 0.6);
      map.setPaintProperty(MAP_LAYERS.trackActualIssrLine, "line-opacity", 1);
      map.setPaintProperty(MAP_LAYERS.trackActualLine, "line-opacity", 0.4);
      map.easeTo({ center: [-35, 48], zoom: 3.2, duration: 800 });
    },

    showCounterfactual: (track) => {
      const map = mapRef.current;
      if (!map || !loadedRef.current) return;
      setSourceData(map, MAP_SOURCES.trackCounterfactual, counterfactualFeature(track));
      map.setLayoutProperty(MAP_LAYERS.trackCounterfactualLine, "visibility", "visible");
      map.setPaintProperty(MAP_LAYERS.trackCounterfactualLine, "line-opacity", 1);
      map.setPaintProperty(MAP_LAYERS.trackActualLine, "line-opacity", 0.3);
      map.setPaintProperty(MAP_LAYERS.trackActualIssrLine, "line-opacity", 0.3);
    },

    preloadCounterfactual: (track) => {
      const map = mapRef.current;
      if (!map || !loadedRef.current) return;
      setSourceData(map, MAP_SOURCES.trackCounterfactual, counterfactualFeature(track));
    },

    setCounterfactualVisible: (visible) => {
      const map = mapRef.current;
      if (!map || !loadedRef.current) return;
      map.setLayoutProperty(
        MAP_LAYERS.trackCounterfactualLine,
        "visibility",
        visible ? "visible" : "none",
      );
      map.setPaintProperty(MAP_LAYERS.trackActualLine, "line-opacity", visible ? 0.3 : 1);
    },

    updateForScene: (scene) => {
      const map = mapRef.current;
      if (!map || !loadedRef.current) return;
      MAP_SCENE_HANDLERS[scene]?.(map);
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
});

export default FlightMap;
