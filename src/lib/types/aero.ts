import type { FlightComparison, SimulationResult } from "./comparison";

export type AeroStatus = "idle" | "listening" | "speaking" | "explaining";

export type AeroState =
  | { status: "idle" }
  | { status: "listening" }
  | { status: "speaking"; messageId: string }
  | { status: "explaining"; targetSelector: string; messageId: string };

export type AeroAction =
  | { type: "START_LISTENING" }
  | { type: "START_SPEAKING"; messageId: string }
  | { type: "START_EXPLAINING"; targetSelector: string; messageId: string }
  | { type: "FINISH" }
  | { type: "DISMISS" };

export type AeroPageContext =
  | { page: "compare"; flights: FlightComparison }
  | { page: "compare-detail"; flightA: Record<string, unknown>; flightB: Record<string, unknown>; betterChoice: string; co2DeltaKg: number; airlineEcoA: string; airlineEcoB: string }
  | { page: "simulate"; baseline: SimulationResult }
  | { page: "airline"; airlineCode: string }
  | { page: "dashboard" }
  | { page: "generic" };

export type AeroTriggerEvent =
  | "compare_opened"
  | "contrail_hover"
  | "booking_complete"
  | "simulation_view";
