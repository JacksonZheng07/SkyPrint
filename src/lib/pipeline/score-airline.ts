import type { AirlineScore } from "@/lib/types/airline";
import { generateAirlineNarrative } from "@/lib/clients/k2-think";
import { scoreToGrade } from "@/lib/utils/grades";
import { AIRLINE_DATA, getSupportedAirlines } from "./airline-data";
import { computeCategories, computeOverallScore } from "./airline-scoring";
import { buildLocalNarrative } from "./airline-narrative";

export { getSupportedAirlines };

async function resolveNarrative(
  data: (typeof AIRLINE_DATA)[string],
  code: string,
  grade: AirlineScore["overallGrade"],
  overallScore: number,
  categories: AirlineScore["categories"],
): Promise<string> {
  try {
    return await generateAirlineNarrative({
      airlineName: data.name,
      airlineCode: code,
      overallGrade: grade,
      overallScore,
      categories,
      fleetAge: data.fleet.averageAge,
      contrailProgramActive: data.contrailProgramActive,
      safPercent: data.safPercent,
    });
  } catch {
    return buildLocalNarrative(data, grade, categories);
  }
}

export async function scoreAirline(airlineCode: string): Promise<AirlineScore> {
  const code = airlineCode.toUpperCase();
  const data = AIRLINE_DATA[code];
  if (!data) {
    throw new Error(
      `Unknown airline: ${airlineCode}. Supported: ${getSupportedAirlines().join(", ")}`,
    );
  }

  const categories = computeCategories(data);
  const overallScore = computeOverallScore(categories);
  const overallGrade = scoreToGrade(overallScore);
  const narrative = await resolveNarrative(data, code, overallGrade, overallScore, categories);

  return {
    airlineCode: code,
    airlineName: data.name,
    overallGrade,
    overallScore,
    categories,
    narrative,
    fleetProfile: data.fleet,
  };
}

/** Score every supported airline, sorted by overall score descending. */
export async function getAllAirlineScores(): Promise<AirlineScore[]> {
  const scores = await Promise.all(getSupportedAirlines().map(scoreAirline));
  return scores.sort((a, b) => b.overallScore - a.overallScore);
}
