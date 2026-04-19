/**
 * Batch-scrapes SerpApi Google Flights for representative routes and
 * collects per-airline carbon_emissions data.
 *
 * carbon_emissions.this_flight  = grams CO2 for that specific flight
 * carbon_emissions.difference_percent = how much above/below the typical
 *   for that route this airline is. Negative = more efficient than average.
 *
 * The difference_percent average across routes is used as the
 * routeOptimization score (replaces the hand-coded estimate).
 *
 * Run via POST /api/admin/scrape-airline-co2
 * Results should be cached and fed back into airline-data.ts over time.
 */

const BASE_URL = "https://serpapi.com/search.json";

// Representative routes that span enough airlines to build a broad sample.
// Future dates only — SerpApi rejects past dates.
const ROUTES = [
  { origin: "JFK", destination: "LHR" },
  { origin: "JFK", destination: "CDG" },
  { origin: "JFK", destination: "FRA" },
  { origin: "LAX", destination: "LHR" },
  { origin: "ORD", destination: "LHR" },
];

interface SerpCarbonFlight {
  airline: string;
  flightNumber: string;
  co2Grams: number;
  differencePercent: number;
  route: string;
}

interface AirlineCo2Stats {
  airlineCode: string;
  airlineName: string;
  sampleCount: number;
  avgCo2Grams: number;
  /** Average % above/below typical for the route. Negative = more efficient. */
  avgDifferencePercent: number;
  /**
   * Derived routeOptimization score 0-100.
   * 50 = average. Each 1% below typical adds ~1.5 points, capped 0-100.
   */
  routeOptScore: number;
  routes: string[];
}

function airlineCodeFromFlightNumber(fn: string): string {
  const m = fn.replace(/\s/g, "").match(/^([A-Z0-9]{2})/);
  return m ? m[1] : "??";
}

async function fetchRoute(
  origin: string,
  destination: string,
  date: string,
  apiKey: string
): Promise<SerpCarbonFlight[]> {
  const url = new URL(BASE_URL);
  url.searchParams.set("engine", "google_flights");
  url.searchParams.set("departure_id", origin);
  url.searchParams.set("arrival_id", destination);
  url.searchParams.set("outbound_date", date);
  url.searchParams.set("type", "2");
  url.searchParams.set("adults", "1");
  url.searchParams.set("travel_class", "1");
  url.searchParams.set("currency", "USD");
  url.searchParams.set("api_key", apiKey);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`SerpApi ${res.status} for ${origin}-${destination}`);

  const data = await res.json();
  if (data.error) throw new Error(`SerpApi error: ${data.error}`);

  const route = `${origin}-${destination}`;
  const results: SerpCarbonFlight[] = [];

  for (const opt of [...(data.best_flights ?? []), ...(data.other_flights ?? [])]) {
    if (!opt.carbon_emissions?.this_flight || !opt.flights?.[0]) continue;
    const firstLeg = opt.flights[0];
    results.push({
      airline: firstLeg.airline,
      flightNumber: firstLeg.flight_number ?? "",
      co2Grams: opt.carbon_emissions.this_flight,
      differencePercent: opt.carbon_emissions.difference_percent ?? 0,
      route,
    });
  }

  return results;
}

function deriveRouteOptScore(avgDiffPct: number): number {
  // 0% diff → score 50 (average)
  // -20% (20% more efficient) → score 80
  // +20% (20% less efficient) → score 20
  // 1% improvement → ~1.5 point increase
  return Math.max(0, Math.min(100, Math.round(50 - avgDiffPct * 1.5)));
}

export async function scrapeAirlineCo2(): Promise<AirlineCo2Stats[]> {
  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey) throw new Error("SERP_API_KEY not set");

  // Use a date ~2 weeks from now so SerpApi returns real schedules
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 14);
  const dateStr = targetDate.toISOString().split("T")[0];

  const allFlights: SerpCarbonFlight[] = [];

  // Fetch routes sequentially to avoid rate limits
  for (const route of ROUTES) {
    try {
      const flights = await fetchRoute(route.origin, route.destination, dateStr, apiKey);
      allFlights.push(...flights);
    } catch (err) {
      console.warn(`Skipping ${route.origin}-${route.destination}:`, err);
    }
    // Small delay between requests
    await new Promise((r) => setTimeout(r, 800));
  }

  // Group by airline code
  const byCode: Record<string, SerpCarbonFlight[]> = {};
  for (const f of allFlights) {
    const code = airlineCodeFromFlightNumber(f.flightNumber);
    if (code === "??") continue;
    if (!byCode[code]) byCode[code] = [];
    byCode[code].push(f);
  }

  // Aggregate per airline
  return Object.entries(byCode)
    .filter(([, flights]) => flights.length >= 1)
    .map(([code, flights]) => {
      const avgCo2 = flights.reduce((s, f) => s + f.co2Grams, 0) / flights.length;
      const avgDiff = flights.reduce((s, f) => s + f.differencePercent, 0) / flights.length;
      return {
        airlineCode: code,
        airlineName: flights[0].airline,
        sampleCount: flights.length,
        avgCo2Grams: Math.round(avgCo2),
        avgDifferencePercent: Math.round(avgDiff * 10) / 10,
        routeOptScore: deriveRouteOptScore(avgDiff),
        routes: [...new Set(flights.map((f) => f.route))],
      };
    })
    .sort((a, b) => a.avgDifferencePercent - b.avgDifferencePercent);
}
