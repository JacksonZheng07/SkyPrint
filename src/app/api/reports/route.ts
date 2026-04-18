import { NextRequest, NextResponse } from "next/server";
import { generateEnvironmentalReport, generateNonProfitReport } from "@/lib/clients/k2-think";
import { getAllAirlineScores } from "@/lib/pipeline/score-airline";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === "nonprofit") {
      const scores = await getAllAirlineScores();
      const airlines = scores.map((s) => ({
        code: s.airlineCode,
        name: s.airlineName,
        grade: s.overallGrade,
        score: s.overallScore,
        contrailMitigation: s.categories.contrailMitigation,
        safPercent: Math.round(s.categories.sustainableFuel / 20 * 10) / 10,
      }));
      const report = await generateNonProfitReport(airlines);
      return NextResponse.json({ report });
    }

    if (type === "government") {
      const { airlineCode, period, totalFlights, totalCo2Kg, co2SavedKg, contrailsAvoided, safUsagePercent } = body;
      if (!airlineCode) {
        return NextResponse.json({ error: "airlineCode required" }, { status: 400 });
      }
      const scores = await getAllAirlineScores();
      const airline = scores.find((s) => s.airlineCode === airlineCode.toUpperCase());
      if (!airline) {
        return NextResponse.json({ error: "Unknown airline" }, { status: 404 });
      }
      const report = await generateEnvironmentalReport({
        airlineName: airline.airlineName,
        airlineCode: airline.airlineCode,
        period: period ?? "2025 Q4",
        totalFlights: totalFlights ?? 50000,
        totalCo2Kg: totalCo2Kg ?? 2500000,
        co2SavedKg: co2SavedKg ?? 125000,
        contrailsAvoided: contrailsAvoided ?? 3200,
        safUsagePercent: safUsagePercent ?? 1.5,
      });
      return NextResponse.json({ report });
    }

    return NextResponse.json({ error: "type must be 'nonprofit' or 'government'" }, { status: 400 });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Report generation failed" },
      { status: 500 }
    );
  }
}
