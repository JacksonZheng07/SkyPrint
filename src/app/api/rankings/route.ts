import { NextResponse } from "next/server";
import { getAllAirlineScores } from "@/lib/pipeline/score-airline";

export async function GET() {
  try {
    const scores = await getAllAirlineScores();
    return NextResponse.json(scores);
  } catch (error) {
    console.error("Rankings error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load rankings" },
      { status: 500 }
    );
  }
}
