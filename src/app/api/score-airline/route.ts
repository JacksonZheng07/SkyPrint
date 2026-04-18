import { NextRequest, NextResponse } from "next/server";
import { scoreAirline } from "@/lib/pipeline/score-airline";

export async function POST(request: NextRequest) {
  try {
    const { airlineCode } = (await request.json()) as {
      airlineCode: string;
    };

    if (!airlineCode) {
      return NextResponse.json(
        { error: "Missing required field: airlineCode" },
        { status: 400 }
      );
    }

    const score = await scoreAirline(airlineCode);
    return NextResponse.json(score);
  } catch (error) {
    console.error("Score airline error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to score airline",
      },
      { status: 500 }
    );
  }
}
