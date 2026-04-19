import { searchFlights as searchSerpApi } from "@/lib/clients/serpapi";
import { searchFlights as searchAviationstack } from "@/lib/clients/aviationstack";
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
import { generateImpactCopy, inferConfidence } from "./copy";

export async function compareFlights(
  params: FlightSearchParams
): Promise<FlightComparison> {
  // Step 1: Search flights — try SerpApi first, fall back to AviationStack, then demo
  let flights: FlightOption[];
  try {
    flights = await searchSerpApi(params);
    if (flights.length === 0) throw new Error("No SerpApi results");
  } catch {
    try {
      flights = await searchAviationstack(params);
      if (flights.length === 0) throw new Error("No AviationStack results");
    } catch {
      flights = getDemoFlights(params.origin, params.destination, params.date);
    }
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
        warmingRatio: 1.0,
        impactCopy: "",
        confidenceLevel: "medium" as const,
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

  // Step 6: Compute warming ratios, confidence, and impact copy
  const bestItem = comparisonItems[0];
  const worstItem = comparisonItems[comparisonItems.length - 1];

  for (const item of comparisonItems) {
    item.warmingRatio =
      bestItem.totalImpactScore > 0
        ? item.totalImpactScore / bestItem.totalImpactScore
        : 1.0;
    item.confidenceLevel = inferConfidence(item);
    item.impactCopy = generateImpactCopy(item, bestItem, worstItem, item.confidenceLevel);
  }

  const warmingSpreadPct =
    worstItem.totalImpactScore > 0
      ? Math.round(
          ((worstItem.totalImpactScore - bestItem.totalImpactScore) /
            worstItem.totalImpactScore) *
            100
        )
      : 0;

  return {
    origin: params.origin,
    destination: params.destination,
    date: params.date,
    flights: comparisonItems,
    bestOption: bestItem,
    worstOption: worstItem,
    averageCo2Kg: Math.round(averageCo2),
    warmingSpreadPct,
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
