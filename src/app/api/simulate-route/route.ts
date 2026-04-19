import { NextRequest, NextResponse } from "next/server";
import { simulateRoute } from "@/lib/pipeline/simulate";
import { AIRPORT_COORDS } from "@/lib/utils/airports";
import { interpolateGreatCircle } from "@/lib/utils/geo";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination, aircraftType, departureTime, cruiseAltitudeFt } =
      body as {
        origin: string;
        destination: string;
        aircraftType: string;
        departureTime: string;
        cruiseAltitudeFt: number;
      };

    if (!origin || !destination || !aircraftType || !departureTime) {
      return NextResponse.json(
        { error: "Missing required fields: origin, destination, aircraftType, departureTime" },
        { status: 400 }
      );
    }

    const originCoords = AIRPORT_COORDS[origin.toUpperCase()];
    const destCoords = AIRPORT_COORDS[destination.toUpperCase()];

    if (!originCoords || !destCoords) {
      return NextResponse.json(
        { error: `Unknown airport code. Supported: ${Object.keys(AIRPORT_COORDS).join(", ")}` },
        { status: 400 }
      );
    }

    const waypoints = interpolateGreatCircle(
      originCoords,
      destCoords,
      20,
      cruiseAltitudeFt || 35000,
      departureTime
    );

    const result = await simulateRoute(waypoints, aircraftType, `${origin}-${destination}`);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Simulate route error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to simulate route",
      },
      { status: 500 }
    );
  }
}
