import type { Waypoint } from "@/lib/types/flight";
import type { ContrailPrediction } from "@/lib/types/contrail";
import type { AltitudeAdjustment } from "@/lib/types/comparison";

const ENGINE_URL = process.env.CONTRAIL_ENGINE_URL ?? "http://localhost:8000";
const API_KEY = process.env.CONTRAIL_ENGINE_API_KEY;

interface EngineWaypoint {
  latitude: number;
  longitude: number;
  altitude_ft: number;
  time: string;
}

function toEngineWaypoints(waypoints: Waypoint[]): EngineWaypoint[] {
  return waypoints.map((wp) => ({
    latitude: wp.latitude,
    longitude: wp.longitude,
    altitude_ft: wp.altitudeFt,
    time: wp.time,
  }));
}

async function engineFetch(path: string, body: unknown): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (API_KEY) {
    headers["X-API-Key"] = API_KEY;
  }

  const response = await fetch(`${ENGINE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Contrail engine ${path} failed (${response.status}): ${error}`);
  }

  return response;
}

export async function predictContrails(
  waypoints: Waypoint[],
  aircraftType: string,
  flightId?: string
): Promise<ContrailPrediction> {
  const response = await engineFetch("/predict", {
    waypoints: toEngineWaypoints(waypoints),
    aircraft_type: aircraftType,
    flight_id: flightId,
  });

  const data = await response.json();
  return {
    flightId: data.flight_id,
    waypointResults: data.waypoint_results.map(
      (wr: Record<string, unknown>) => ({
        sacSatisfied: wr.sac_satisfied,
        persistent: wr.persistent,
        rfNetWM2: wr.rf_net_w_m2,
        contrailAgeHours: wr.contrail_age_hours,
        efJPerM: wr.ef_j_per_m,
      })
    ),
    summary: {
      contrailProbability: data.summary.contrail_probability,
      totalEnergyForcingJ: data.summary.total_energy_forcing_j,
      meanRfNetWM2: data.summary.mean_rf_net_w_m2,
      maxContrailLifetimeHours: data.summary.max_contrail_lifetime_hours,
    },
    co2Kg: data.co2_kg,
    usedFallback: data.used_fallback,
  };
}

export async function compareTrajectories(
  trajectoryA: Waypoint[],
  trajectoryB: Waypoint[],
  aircraftType: string
) {
  const response = await engineFetch("/compare", {
    trajectory_a: toEngineWaypoints(trajectoryA),
    trajectory_b: toEngineWaypoints(trajectoryB),
    aircraft_type: aircraftType,
  });

  return response.json();
}

export async function optimizeAltitude(
  waypoints: Waypoint[],
  aircraftType: string
): Promise<{
  original: ContrailPrediction;
  optimized: ContrailPrediction;
  altitudeAdjustments: AltitudeAdjustment[];
  efReductionPercent: number;
}> {
  const response = await engineFetch("/optimize", {
    waypoints: toEngineWaypoints(waypoints),
    aircraft_type: aircraftType,
  });

  const data = await response.json();
  return {
    original: data.original,
    optimized: data.optimized,
    altitudeAdjustments: data.altitude_adjustments.map(
      (adj: Record<string, unknown>) => ({
        waypointIndex: adj.waypoint_index,
        originalAltitudeFt: adj.original_altitude_ft,
        suggestedAltitudeFt: adj.suggested_altitude_ft,
        reason: adj.reason,
      })
    ),
    efReductionPercent: data.ef_reduction_percent,
  };
}

export async function checkHealth(): Promise<{
  status: string;
  pycontrailsAvailable: boolean;
  version: string;
}> {
  const response = await fetch(`${ENGINE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Contrail engine health check failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    status: data.status,
    pycontrailsAvailable: data.pycontrails_available,
    version: data.version,
  };
}
