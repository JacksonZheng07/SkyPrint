import { searchFlights as searchSerpApi } from "@/lib/clients/serpapi";
import { searchFlights as searchAviationstack } from "@/lib/clients/aviationstack";
import { predictContrails } from "@/lib/clients/contrail-engine";
import { getDemoFlights } from "@/lib/demo/flights";
import { k2AssessFlightClimate } from "@/lib/clients/k2-reasoning";
import type {
  FlightComparison,
  FlightComparisonItem,
} from "@/lib/types/comparison";
import type { FlightOption, FlightSearchParams, Waypoint } from "@/lib/types/flight";
import { AIRPORT_COORDS } from "@/lib/utils/airports";
import { interpolateGreatCircle, greatCircleDistanceKm } from "@/lib/utils/geo";
import { calculateCo2PerPax, calculateContrailScore } from "@/lib/utils/aircraft";
import {
  calculateContrailMetrics,
  calculateContrailMetricsK2,
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

  // Calculate great-circle distance for this route
  const originCoords = AIRPORT_COORDS[params.origin];
  const destCoords = AIRPORT_COORDS[params.destination];
  const distanceKm = originCoords && destCoords
    ? Math.round(greatCircleDistanceKm(
        originCoords.latitude, originCoords.longitude,
        destCoords.latitude, destCoords.longitude
      ))
    : 0;

  // Step 2: Generate trajectories for each flight
  const flightsWithTrajectories = flights.slice(0, 6).map((flight) => ({
    flight,
    waypoints: getTrajectory(flight, params),
  }));

  // Step 3: Get contrail predictions — try real engine, then K2 reasoning, then local fallback
  const comparisonItems: FlightComparisonItem[] = await Promise.all(
    flightsWithTrajectories.map(async ({ flight, waypoints }, index) => {
      let contrail;
      let metrics;

      try {
        // First: try the real contrail engine
        contrail = await predictContrails(
          waypoints,
          flight.aircraftType,
          flight.flightId
        );
        // If real engine works, score with K2 or local
        const depHour = flight.departureTime
          ? new Date(flight.departureTime).getUTCHours()
          : 12;
        try {
          metrics = await calculateContrailMetricsK2(contrail, flight.aircraftType, depHour);
        } catch {
          metrics = calculateContrailMetrics(contrail);
        }

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
      } catch {
        // Contrail engine unavailable — use centralized ICAO calculation + K2 for reasoning
        const depHour = flight.departureTime
          ? new Date(flight.departureTime).getUTCHours()
          : 12;

        // Deterministic numbers from centralized aircraft data
        const co2Kg = calculateCo2PerPax({
          aircraftType: flight.aircraftType,
          distanceKm,
          stops: flight.stops,
        });
        const contrailResult = calculateContrailScore({
          aircraftType: flight.aircraftType,
          departureHourUTC: depHour,
          durationMinutes: flight.duration,
          distanceKm,
        });

        // K2 provides reasoning narrative only (numbers come from above)
        let reasoning = "";
        try {
          const assessment = await k2AssessFlightClimate({
            airline: flight.airline,
            airlineCode: flight.airlineCode,
            aircraftType: flight.aircraftType,
            origin: params.origin,
            destination: params.destination,
            distanceKm,
            durationMinutes: flight.duration,
            departureTimeISO: flight.departureTime,
            stops: flight.stops,
          });
          reasoning = assessment.reasoning;
        } catch {
          // K2 unavailable — empty reasoning is fine
        }

        const isShortHaul = distanceKm < 1500;
        const co2Component = Math.min(50, (co2Kg / (isShortHaul ? 150 : distanceKm < 4000 ? 300 : 600)) * 40);
        const totalScore = Math.min(100, Math.max(0, Math.round(co2Component + contrailResult.impactScore * 0.6)));

        contrail = {
          flightId: flight.flightId,
          waypointResults: [],
          summary: {
            contrailProbability: contrailResult.impactScore / 100,
            totalEnergyForcingJ: 0,
            meanRfNetWM2: 0,
            maxContrailLifetimeHours: 0,
          },
          co2Kg,
          usedFallback: true,
        };

        metrics = {
          riskRating: contrailResult.riskRating,
          impactScore: contrailResult.impactScore,
          formationAltitudeFt: undefined,
          persistenceHours: undefined,
        };

        return {
          flight,
          contrail,
          metrics,
          totalImpactScore: totalScore,
          rank: index + 1,
          warmingRatio: 1.0,
          impactCopy: reasoning,
          confidenceLevel: "medium" as const,
        };
      }
    })
  );

  // Step 4: Calculate average CO2 and recalculate total impact for engine-sourced items
  const averageCo2 =
    comparisonItems.reduce((sum, item) => sum + item.contrail.co2Kg, 0) /
    comparisonItems.length;

  for (const item of comparisonItems) {
    // Only recalculate if not already set by K2 (totalImpactScore === 0 means engine path)
    if (item.totalImpactScore === 0) {
      item.totalImpactScore = calculateTotalImpactScore(
        item.contrail.co2Kg,
        item.metrics,
        averageCo2
      );
    }
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
    // Preserve K2 reasoning if already set, otherwise generate copy
    if (!item.impactCopy || !item.contrail.usedFallback) {
      item.impactCopy = generateImpactCopy(item, bestItem, worstItem, item.confidenceLevel);
    }
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
