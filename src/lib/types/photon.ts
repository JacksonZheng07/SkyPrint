import type { ContrailMetrics } from "./contrail";
import type { FlightComparison, ImpactSummary } from "./comparison";

export type PhotonEventType =
  | "flight_booked"
  | "pre_flight_24h"
  | "in_flight"
  | "post_flight"
  | "long_term_stats";

export interface PhotonEventPayload {
  flightData?: FlightComparison;
  contrailData?: ContrailMetrics;
  impactSummary?: ImpactSummary;
  userStats?: UserLifetimeStats;
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
