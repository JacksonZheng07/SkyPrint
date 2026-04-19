export const MAP_COLORS = {
  trackNeutral: "#888888",
  trackIssr: "#FF4444",
  counterfactual: "#00E5CC",
  issrFill: "#F59E0B",
} as const;

export const MAP_SOURCES = {
  trackActual: "track-actual",
  trackActualIssr: "track-actual-issr",
  trackCounterfactual: "track-counterfactual",
  issrOverlay: "issr-overlay",
  aircraftPosition: "aircraft-position",
} as const;

export const MAP_LAYERS = {
  issrFill: "issr-fill",
  trackActualLine: "track-actual-line",
  trackActualIssrLine: "track-actual-issr-line",
  trackCounterfactualLine: "track-counterfactual-line",
  aircraftDot: "aircraft-dot",
} as const;
