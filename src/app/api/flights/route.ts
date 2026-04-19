import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const manifestPath = path.join(
      process.cwd(),
      "services/contrail_engine/data/pipeline_output/manifest.json"
    );

    if (!fs.existsSync(manifestPath)) {
      return NextResponse.json({ flights: [], total: 0 });
    }

    const raw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(raw) as {
      flights: {
        icao24: string;
        callsign: string;
        airline: string;
        dep: string;
        arr: string;
        first_seen: number;
        last_seen: number;
      }[];
    };

    return NextResponse.json({
      flights: manifest.flights ?? [],
      total: manifest.flights?.length ?? 0,
    });
  } catch (error) {
    console.error("Flights API error:", error);
    return NextResponse.json({ flights: [], total: 0 });
  }
}
