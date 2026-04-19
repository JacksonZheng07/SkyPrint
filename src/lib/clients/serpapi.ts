import type { FlightOption, FlightSearchParams } from "@/lib/types/flight";

const BASE_URL = "https://serpapi.com/search.json";

interface SerpFlightLeg {
  departure_airport: { name: string; id: string; time: string };
  arrival_airport: { name: string; id: string; time: string };
  duration: number;
  airplane?: string;
  airline: string;
  flight_number: string;
}

interface SerpFlightOption {
  flights: SerpFlightLeg[];
  total_duration: number;
  price: number;
}

interface SerpApiResponse {
  best_flights?: SerpFlightOption[];
  other_flights?: SerpFlightOption[];
  error?: string;
}

const AIRCRAFT_MAP: [string, string][] = [
  ["boeing 787-10", "B78X"],
  ["boeing 787-9", "B789"],
  ["boeing 787-8", "B789"],
  ["boeing 787", "B789"],
  ["boeing 777-300", "B77W"],
  ["boeing 777-200", "B77W"],
  ["boeing 777", "B77W"],
  ["boeing 737-900", "B739"],
  ["boeing 737", "B738"],
  ["airbus a350-1000", "A35K"],
  ["airbus a350-900", "A359"],
  ["airbus a350", "A359"],
  ["airbus a330-200", "A332"],
  ["airbus a330", "A333"],
  ["airbus a321", "A321"],
  ["airbus a320", "A320"],
  ["embraer 190", "E190"],
  ["embraer erj-190", "E190"],
];

function mapAircraftType(airplane: string): string {
  const lower = airplane.toLowerCase();
  for (const [key, code] of AIRCRAFT_MAP) {
    if (lower.includes(key)) return code;
  }
  return "B738";
}

function parseTime(serpTime: string, date: string): string {
  if (!serpTime) return `${date}T00:00:00Z`;
  // SerpApi: "2024-01-15 08:00" — no tz, treat as UTC approximation
  const normalized = serpTime.replace(" ", "T");
  return normalized.includes("Z") ? normalized : `${normalized}:00Z`;
}

function airlineCode(flightNumber: string): string {
  const match = flightNumber.match(/^([A-Z0-9]{2})/);
  return match ? match[1] : "??";
}

export async function searchFlights(
  params: FlightSearchParams
): Promise<FlightOption[]> {
  const key = process.env.SERP_API_KEY;
  if (!key) throw new Error("SERP_API_KEY not set");

  const url = new URL(BASE_URL);
  url.searchParams.set("engine", "google_flights");
  url.searchParams.set("departure_id", params.origin);
  url.searchParams.set("arrival_id", params.destination);
  url.searchParams.set("outbound_date", params.date);
  url.searchParams.set("type", "2"); // one-way
  url.searchParams.set("adults", String(params.passengers ?? 1));
  url.searchParams.set("travel_class", "1"); // economy
  url.searchParams.set("currency", "USD");
  url.searchParams.set("api_key", key);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`SerpApi HTTP ${res.status}`);

  const data: SerpApiResponse = await res.json();
  if (data.error) throw new Error(`SerpApi: ${data.error}`);

  const options: SerpFlightOption[] = [
    ...(data.best_flights ?? []),
    ...(data.other_flights ?? []),
  ];

  return options
    .filter((opt) => opt.flights?.length > 0 && opt.price > 0)
    .map((opt, i) => {
      const first = opt.flights[0];
      const last = opt.flights[opt.flights.length - 1];
      return {
        flightId: `serp-${params.origin}-${params.destination}-${params.date}-${i}`,
        airline: first.airline,
        airlineCode: airlineCode(first.flight_number),
        flightNumber: first.flight_number,
        origin: params.origin,
        destination: params.destination,
        departureTime: parseTime(first.departure_airport.time, params.date),
        arrivalTime: parseTime(last.arrival_airport.time, params.date),
        aircraftType: mapAircraftType(first.airplane ?? ""),
        duration: opt.total_duration,
        stops: opt.flights.length - 1,
        price: opt.price,
      };
    });
}
