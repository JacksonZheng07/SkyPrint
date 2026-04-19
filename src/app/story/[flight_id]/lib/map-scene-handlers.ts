import mapboxgl from "mapbox-gl";
import type { SceneName } from "../hooks/useScrollama";
import { MAP_LAYERS } from "./map-constants";

export const MAP_SCENE_HANDLERS: Record<SceneName, (map: mapboxgl.Map) => void> = {
  flight: (map) => {
    map.setPaintProperty(MAP_LAYERS.issrFill, "fill-opacity", 0);
    map.setPaintProperty(MAP_LAYERS.trackActualLine, "line-opacity", 1);
    map.setPaintProperty(MAP_LAYERS.trackActualIssrLine, "line-opacity", 0);
    map.setLayoutProperty(MAP_LAYERS.trackCounterfactualLine, "visibility", "none");
  },
  issr: (map) => {
    map.setPaintProperty(MAP_LAYERS.trackActualLine, "line-opacity", 0.4);
    map.setPaintProperty(MAP_LAYERS.trackActualIssrLine, "line-opacity", 1);
    map.setPaintProperty(MAP_LAYERS.issrFill, "fill-opacity", 0.55);
    map.setLayoutProperty(MAP_LAYERS.trackCounterfactualLine, "visibility", "none");
  },
  receipt: (map) => {
    map.setLayoutProperty(MAP_LAYERS.trackCounterfactualLine, "visibility", "none");
  },
  counterfactual: (map) => {
    map.setLayoutProperty(MAP_LAYERS.trackCounterfactualLine, "visibility", "visible");
    map.setPaintProperty(MAP_LAYERS.trackCounterfactualLine, "line-opacity", 1);
    map.setPaintProperty(MAP_LAYERS.trackActualLine, "line-opacity", 0.3);
    map.setPaintProperty(MAP_LAYERS.trackActualIssrLine, "line-opacity", 0.3);
  },
  // context scene: map opacity handled via CSS on the container
  context: () => {},
};
