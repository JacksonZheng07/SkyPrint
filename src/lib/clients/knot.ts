/**
 * Knot API client — flight booking integration.
 * Provides access to user's connected travel accounts and booking data.
 */

const KNOT_BASE_URL = "https://api.knotapi.com/v2";

interface KnotSession {
  session_id: string;
  status: string;
}

interface KnotTransaction {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  date: string;
  category: string;
  description: string;
}

interface KnotFlightBooking {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  passengerName: string;
  bookingReference: string;
  price: number;
  currency: string;
}

async function knotFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const clientId = process.env.KNOT_CLIENT_ID;
  const secret = process.env.KNOT_SECRET;

  if (!clientId || !secret) {
    throw new Error("KNOT_CLIENT_ID and KNOT_SECRET required");
  }

  const res = await fetch(`${KNOT_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Knot-Client-Id": clientId,
      "X-Knot-Secret": secret,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Knot API error ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * Create a Knot session for a user to connect their travel accounts.
 */
export async function createKnotSession(userId: string): Promise<KnotSession> {
  return knotFetch<KnotSession>("/sessions", {
    method: "POST",
    body: JSON.stringify({
      external_user_id: userId,
      products: ["transactions"],
      merchant_ids: [
        44, // United Airlines
        45, // American Airlines
        46, // Delta Air Lines
        47, // Southwest Airlines
        48, // JetBlue
      ],
    }),
  });
}

/**
 * Get travel transactions for a user.
 */
export async function getUserTransactions(userId: string): Promise<KnotTransaction[]> {
  return knotFetch<KnotTransaction[]>(`/users/${userId}/transactions`);
}

/**
 * Extract flight bookings from user's connected travel accounts.
 * In production, this would parse actual Knot transaction data.
 * For now, provides a structured interface for the booking flow.
 */
export async function getUserFlightBookings(userId: string): Promise<KnotFlightBooking[]> {
  try {
    const transactions = await getUserTransactions(userId);
    // Filter for airline transactions and map to flight bookings
    return transactions
      .filter((t) => t.category === "travel" || t.category === "airline")
      .map((t) => ({
        id: t.id,
        airline: t.merchant,
        airlineCode: extractAirlineCode(t.merchant),
        flightNumber: "",
        origin: "",
        destination: "",
        departureTime: t.date,
        arrivalTime: t.date,
        passengerName: "",
        bookingReference: "",
        price: t.amount,
        currency: t.currency,
      }));
  } catch {
    return [];
  }
}

function extractAirlineCode(merchant: string): string {
  const mapping: Record<string, string> = {
    "United Airlines": "UA",
    "American Airlines": "AA",
    "Delta Air Lines": "DL",
    "British Airways": "BA",
    Lufthansa: "LH",
    "Southwest Airlines": "WN",
    JetBlue: "B6",
  };
  return mapping[merchant] ?? "";
}
