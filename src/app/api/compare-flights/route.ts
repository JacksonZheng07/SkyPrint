import { NextRequest, NextResponse } from "next/server";
import { compareFlights } from "@/lib/pipeline/compare";
import type { FlightSearchParams } from "@/lib/types/flight";

export async function POST(request: NextRequest) {
  try {
    const body: FlightSearchParams = await request.json();

    if (!body.origin || !body.destination || !body.date) {
      return NextResponse.json(
        { error: "Missing required fields: origin, destination, date" },
        { status: 400 }
      );
    }

    const comparison = await compareFlights(body);
    return NextResponse.json(comparison);
  } catch (error) {
    console.error("Compare flights error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to compare flights",
      },
      { status: 500 }
    );
  }
}
