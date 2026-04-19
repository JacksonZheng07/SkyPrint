import mapboxgl from "mapbox-gl";
import { MAP_COLORS, MAP_LAYERS, MAP_SOURCES } from "./map-constants";

const EMPTY_LINE_FEATURE: GeoJSON.Feature = {
  type: "Feature",
  properties: {},
  geometry: { type: "LineString", coordinates: [] },
};

const EMPTY_FEATURE_COLLECTION: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

const EMPTY_POINT_FEATURE: GeoJSON.Feature = {
  type: "Feature",
  properties: { bearing: 0 },
  geometry: { type: "Point", coordinates: [0, 0] },
};

/** Register all GeoJSON sources used by the story map. */
export function registerMapSources(map: mapboxgl.Map): void {
  map.addSource(MAP_SOURCES.trackActual, { type: "geojson", data: EMPTY_LINE_FEATURE });
  map.addSource(MAP_SOURCES.trackActualIssr, { type: "geojson", data: EMPTY_FEATURE_COLLECTION });
  map.addSource(MAP_SOURCES.trackCounterfactual, { type: "geojson", data: EMPTY_LINE_FEATURE });
  map.addSource(MAP_SOURCES.issrOverlay, { type: "geojson", data: EMPTY_FEATURE_COLLECTION });
  map.addSource(MAP_SOURCES.aircraftPosition, { type: "geojson", data: EMPTY_POINT_FEATURE });
}

/** Register all display layers on top of registered sources. */
export function registerMapLayers(map: mapboxgl.Map): void {
  map.addLayer({
    id: MAP_LAYERS.issrFill,
    type: "fill",
    source: MAP_SOURCES.issrOverlay,
    paint: { "fill-color": MAP_COLORS.issrFill, "fill-opacity": 0 },
  });

  map.addLayer({
    id: MAP_LAYERS.trackActualLine,
    type: "line",
    source: MAP_SOURCES.trackActual,
    paint: { "line-color": MAP_COLORS.trackNeutral, "line-width": 2.5, "line-opacity": 1 },
    layout: { "line-cap": "round", "line-join": "round" },
  });

  map.addLayer({
    id: MAP_LAYERS.trackActualIssrLine,
    type: "line",
    source: MAP_SOURCES.trackActualIssr,
    paint: { "line-color": MAP_COLORS.trackIssr, "line-width": 3, "line-opacity": 0 },
    layout: { "line-cap": "round", "line-join": "round" },
  });

  map.addLayer({
    id: MAP_LAYERS.trackCounterfactualLine,
    type: "line",
    source: MAP_SOURCES.trackCounterfactual,
    paint: { "line-color": MAP_COLORS.counterfactual, "line-width": 2.5, "line-opacity": 0 },
    layout: { "line-cap": "round", "line-join": "round", visibility: "none" },
  });

  map.addLayer({
    id: MAP_LAYERS.aircraftDot,
    type: "circle",
    source: MAP_SOURCES.aircraftPosition,
    paint: {
      "circle-radius": 5,
      "circle-color": "#ffffff",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
      "circle-opacity": 1,
    },
  });
}
