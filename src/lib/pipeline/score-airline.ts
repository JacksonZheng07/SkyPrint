import type { AirlineScore } from "@/lib/types/airline";
import { generateAirlineNarrative, generateAirlineFullReport } from "@/lib/clients/k2-think";
import { scoreToGrade } from "@/lib/utils/grades";
import { AIRLINE_DATA, getSupportedAirlines } from "./airline-data";
import { computeCategories, computeOverallScore, scoreToTier } from "./airline-scoring";
import { buildLocalNarrative, buildLocalReport } from "./airline-narrative";

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

  const k2Context = {
    airlineName: data.name,
    airlineCode: code,
    overallGrade,
    overallScore,
    tier: scoreToTier(overallScore),
    categories,
    fleetAge: data.fleet.averageAge,
    totalAircraft: data.fleet.totalAircraft,
    aircraftTypes: data.fleet.aircraftTypes,
    contrailProgramActive: data.contrailProgramActive,
    safPercent: data.safPercent,
  };

  const tier = scoreToTier(overallScore);
  const localReport = buildLocalReport(data, overallGrade, overallScore, categories, tier);

  // Run K2 narrative + full report in parallel, fall back to local for each
  const [narrativeResult, reportResult] = await Promise.allSettled([
    generateAirlineNarrative(k2Context),
    generateAirlineFullReport(k2Context),
  ]);

  const narrative =
    narrativeResult.status === "fulfilled"
      ? narrativeResult.value
      : buildLocalNarrative(data, overallGrade, categories);

  const report = reportResult.status === "fulfilled" ? reportResult.value : localReport;

  return {
    airlineCode: code,
    airlineName: data.name,
    overallGrade,
    overallScore,
    tier,
    categories,
    safPercent: data.safPercent,
    narrative,
    report,
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
  const tier = scoreToTier(overallScore);
  const narrative = buildLocalNarrative(data, overallGrade, categories);
  const report = buildLocalReport(data, overallGrade, overallScore, categories, tier);

  return {
    airlineCode: code,
    airlineName: data.name,
    overallGrade,
    overallScore,
    tier,
    categories,
    safPercent: data.safPercent,
    narrative,
    report,
    fleetProfile: data.fleet,
  };
}

/** Score every supported airline, sorted by overall score descending. Instant — no API calls. */
export async function getAllAirlineScores(): Promise<AirlineScore[]> {
  const scores = getSupportedAirlines().map(scoreAirlineLocal);
  return scores.sort((a, b) => b.overallScore - a.overallScore);
}
