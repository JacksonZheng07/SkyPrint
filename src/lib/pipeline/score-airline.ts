import type { AirlineScore } from "@/lib/types/airline";
import { generateAirlineNarrative } from "@/lib/clients/k2-think";
import { scoreToGrade } from "@/lib/utils/grades";
import { AIRLINE_DATA, getSupportedAirlines } from "./airline-data";
import { computeCategories, computeOverallScore, scoreToTier } from "./airline-scoring";
import { buildLocalNarrative } from "./airline-narrative";

export { getSupportedAirlines };

/**
 * Score a single airline with full K2 narrative (used by detail page).
 * This makes one K2 API call for the narrative.
 */
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

  // Try K2 narrative for detail pages, fall back to local
  let narrative: string;
  try {
    narrative = await generateAirlineNarrative({
      airlineName: data.name,
      airlineCode: code,
      overallGrade,
      overallScore,
      categories,
      fleetAge: data.fleet.averageAge,
      contrailProgramActive: data.contrailProgramActive,
      safPercent: data.safPercent,
    });
  } catch {
    narrative = buildLocalNarrative(data, overallGrade, categories);
  }

  return {
    airlineCode: code,
    airlineName: data.name,
    overallGrade,
    overallScore,
    tier: scoreToTier(overallScore),
    categories,
    narrative,
    fleetProfile: data.fleet,
  };
}

/**
 * Score a single airline with local narrative only (no API call).
 * Used for rankings list where we score all 28 airlines at once.
 */
function scoreAirlineLocal(airlineCode: string): AirlineScore {
  const code = airlineCode.toUpperCase();
  const data = AIRLINE_DATA[code];
  if (!data) {
    throw new Error(`Unknown airline: ${airlineCode}`);
  }

  const categories = computeCategories(data);
  const overallScore = computeOverallScore(categories);
  const overallGrade = scoreToGrade(overallScore);
  const narrative = buildLocalNarrative(data, overallGrade, categories);

  return {
    airlineCode: code,
    airlineName: data.name,
    overallGrade,
    overallScore,
    tier: scoreToTier(overallScore),
    categories,
    narrative,
    fleetProfile: data.fleet,
  };
}

/** Score every supported airline, sorted by overall score descending. Instant — no API calls. */
export async function getAllAirlineScores(): Promise<AirlineScore[]> {
  const scores = getSupportedAirlines().map(scoreAirlineLocal);
  return scores.sort((a, b) => b.overallScore - a.overallScore);
}
