import type { FlightOption, FlightSearchParams } from "@/lib/types/flight";

const BASE_URL = "https://api.aviationstack.com/v1";
const API_KEY = process.env.AVIATIONSTACK_API_KEY!;

interface AviationstackFlight {
  flight_date: string;
  flight_status: string;
  departure: {
    airport: string;
    iata: string;
    scheduled: string;
    estimated: string;
    actual: string | null;
  };
  arrival: {
    airport: string;
    iata: string;
    scheduled: string;
    estimated: string;
    actual: string | null;
  };
  airline: {
    name: string;
    iata: string;
  };
  flight: {
    number: string;
    iata: string;
  };
  aircraft: {
    iata: string;
  } | null;
}

interface AviationstackResponse {
  pagination: { total: number; count: number };
  data: AviationstackFlight[];
}

export async function searchFlights(
  params: FlightSearchParams
): Promise<FlightOption[]> {
  const url = new URL(`${BASE_URL}/flights`);
  url.searchParams.set("access_key", API_KEY);
  url.searchParams.set("dep_iata", params.origin);
  url.searchParams.set("arr_iata", params.destination);
  url.searchParams.set("flight_date", params.date);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Aviationstack API error: ${response.status}`);
  }

  const data: AviationstackResponse = await response.json();

  return data.data
    .filter((f) => f.departure.scheduled && f.arrival.scheduled)
    .map((f, i) => ({
      flightId: `${f.flight.iata}-${params.date}-${i}`,
      airline: f.airline.name,
      airlineCode: f.airline.iata,
      flightNumber: f.flight.iata,
      origin: params.origin,
      destination: params.destination,
      departureTime: f.departure.scheduled,
      arrivalTime: f.arrival.scheduled,
      aircraftType: f.aircraft?.iata ?? "B738",
      duration: calculateDurationMinutes(
        f.departure.scheduled,
        f.arrival.scheduled
      ),
      stops: 0,
    }));
}

export async function getFlightStatus(flightIata: string) {
  const url = new URL(`${BASE_URL}/flights`);
  url.searchParams.set("access_key", API_KEY);
  url.searchParams.set("flight_iata", flightIata);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Aviationstack API error: ${response.status}`);
  }

  const data: AviationstackResponse = await response.json();
  return data.data[0] ?? null;
}

function calculateDurationMinutes(departure: string, arrival: string): number {
  const dep = new Date(departure).getTime();
  const arr = new Date(arrival).getTime();
  return Math.round((arr - dep) / 60000);
}
