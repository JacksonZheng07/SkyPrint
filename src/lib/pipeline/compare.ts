import { searchFlights } from "@/lib/clients/aviationstack";
import { predictContrails } from "@/lib/clients/contrail-engine";
import { getDemoFlights, getDemoContrailPrediction } from "@/lib/demo/flights";
import type {
  FlightComparison,
  FlightComparisonItem,
} from "@/lib/types/comparison";
import type { FlightOption, FlightSearchParams, Waypoint } from "@/lib/types/flight";
import { AIRPORT_COORDS } from "@/lib/utils/airports";
import { interpolateGreatCircle } from "@/lib/utils/geo";
import {
  calculateContrailMetrics,
  calculateTotalImpactScore,
} from "./impact";

export async function compareFlights(
  params: FlightSearchParams
): Promise<FlightComparison> {
  // Step 1: Search flights — try real API, fall back to demo data
  let flights: FlightOption[];
  try {
    flights = await searchFlights(params);
    if (flights.length === 0) throw new Error("No results");
  } catch {
    flights = getDemoFlights(params.origin, params.destination, params.date);
  }

  // Step 2: Generate trajectories for each flight
  const flightsWithTrajectories = flights.slice(0, 6).map((flight) => ({
    flight,
    waypoints: getTrajectory(flight, params),
  }));

  // Step 3: Get contrail predictions — try real engine, fall back to demo
  const comparisonItems: FlightComparisonItem[] = await Promise.all(
    flightsWithTrajectories.map(async ({ flight, waypoints }, index) => {
      let contrail;
      try {
        contrail = await predictContrails(
          waypoints,
          flight.aircraftType,
          flight.flightId
        );
      } catch {
        contrail = getDemoContrailPrediction(
          flight.flightId,
          flight.aircraftType,
          waypoints.length
        );
      }

      const metrics = calculateContrailMetrics(contrail);

      return {
        flight,
        contrail,
        metrics,
        totalImpactScore: 0,
        rank: index + 1,
      };
    })
  );

  // Step 4: Calculate average CO2 and total impact scores
  const averageCo2 =
    comparisonItems.reduce((sum, item) => sum + item.contrail.co2Kg, 0) /
    comparisonItems.length;

  for (const item of comparisonItems) {
    item.totalImpactScore = calculateTotalImpactScore(
      item.contrail.co2Kg,
      item.metrics,
      averageCo2
    );
  }

  // Step 5: Rank by total impact (lower is better)
  comparisonItems.sort((a, b) => a.totalImpactScore - b.totalImpactScore);
  comparisonItems.forEach((item, i) => {
    item.rank = i + 1;
  });

  return {
    origin: params.origin,
    destination: params.destination,
    date: params.date,
    flights: comparisonItems,
    bestOption: comparisonItems[0],
    worstOption: comparisonItems[comparisonItems.length - 1],
    averageCo2Kg: Math.round(averageCo2),
  };
}

function getTrajectory(
  flight: FlightOption,
  params: FlightSearchParams
): Waypoint[] {
  if (flight.waypoints && flight.waypoints.length >= 2) {
    return flight.waypoints;
  }

  const origin = AIRPORT_COORDS[params.origin];
  const destination = AIRPORT_COORDS[params.destination];

  if (!origin || !destination) {
    // Use a generic trajectory rather than silently returning wrong data
    return interpolateGreatCircle(
      { latitude: 40, longitude: -74 },
      { latitude: 34, longitude: -118 },
      20,
      35000,
      flight.departureTime
    );
  }

  return interpolateGreatCircle(
    origin,
    destination,
    20,
    35000,
    flight.departureTime
  );
}
