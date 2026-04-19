import type { Waypoint } from "@/lib/types/flight";
import type { ContrailPrediction } from "@/lib/types/contrail";
import type { AltitudeAdjustment } from "@/lib/types/comparison";
import type {
  RouteHistoryRequest,
  RouteHistoryResponse,
  RouteGeometryPoint,
} from "@/lib/types/route-geometry";

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

export async function getHistoricalRouteGeometry(
  params: RouteHistoryRequest
): Promise<RouteHistoryResponse> {
  const response = await engineFetch("/route-history", {
    callsign: params.callsign,
    icao24: params.icao24,
    departure_time_unix: params.departureTimeUnix,
    aircraft_type: params.aircraftType,
  });

  const data = await response.json();

  function toGeoPoint(p: Record<string, unknown>): RouteGeometryPoint {
    return {
      timeUnix: p.time_unix as number,
      latitude: p.latitude as number,
      longitude: p.longitude as number,
      altitudeFt: p.altitude_ft as number,
      contrailRisk: p.contrail_risk as boolean,
    };
  }

  return {
    flightId: data.flight_id,
    callsign: data.callsign,
    icao24: data.icao24,
    aircraftType: data.aircraft_type,
    originalPath: (data.original_path as Record<string, unknown>[]).map(toGeoPoint),
    optimalPath: (data.optimal_path as Record<string, unknown>[]).map(toGeoPoint),
    co2KgOriginal: data.co2_kg_original,
    co2KgOptimal: data.co2_kg_optimal,
    co2KgDelta: data.co2_kg_delta,
    nContrailWaypoints: data.n_contrail_waypoints,
    nTotalWaypoints: data.n_total_waypoints,
    fuelPenaltyPct: data.fuel_penalty_pct,
    efReductionPct: data.ef_reduction_pct,
    avoidable: data.avoidable,
    usedSacFallback: data.used_sac_fallback,
    altitudeAdjustments: data.altitude_adjustments,
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
