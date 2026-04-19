import type { ContrailMetrics } from "./contrail";
import type { FlightComparison, ImpactSummary } from "./comparison";

export type PhotonEventType =
  | "flight_booked"
  | "greener_alternative"
  | "pre_flight_24h"
  | "in_flight"
  | "post_flight"
  | "long_term_stats";

export interface GreenerAlternative {
  bookedAirline: string;
  bookedFlightNumber: string;
  bookedPrice?: number;
  bookedCo2Kg: number;
  bookedImpactScore: number;
  altAirline: string;
  altFlightNumber: string;
  altPrice?: number;
  altCo2Kg: number;
  altImpactScore: number;
  origin: string;
  destination: string;
  impactReductionPct: number; // how much greener the alternative is
  compareUrl?: string; // deep link back to comparison page
}

export interface PhotonEventPayload {
  flightData?: FlightComparison;
  contrailData?: ContrailMetrics;
  impactSummary?: ImpactSummary;
  userStats?: UserLifetimeStats;
  greenerAlt?: GreenerAlternative;
  phoneNumber?: string; // For iMessage delivery via spectrum-ts
}

export interface PhotonEvent {
  userId: string;
  eventType: PhotonEventType;
  payload: PhotonEventPayload;
  scheduledFor?: string; // ISO date for deferred events
}

export interface UserLifetimeStats {
  totalCo2Saved: number;
  flightsOptimized: number;
  totalFlights: number;
  memberSince: string;
}

export interface NotificationContent {
  subject: string;
  body: string;
  channel: "push" | "email" | "in_app";
}
