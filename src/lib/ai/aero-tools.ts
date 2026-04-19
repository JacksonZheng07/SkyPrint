import { z } from "zod";
import { tool } from "ai";
import { co2ToCarMiles, co2ToTrees } from "@/lib/utils/units";
import { AIRLINE_DATA, getSupportedAirlines } from "@/lib/pipeline/airline-data";
import { computeCategories, computeOverallScore } from "@/lib/pipeline/airline-scoring";
import { scoreToGrade } from "@/lib/utils/grades";

export const navigateTool = tool({
  description: `Navigate within the SkyPrint app. ONLY use when the user's request clearly maps to one of the listed app pages. Do NOT call this tool for:
- external places, countries, cities, or real-world locations (e.g. "take me to China", "go to Paris")
- vague requests with no clear page match
- small-talk or informational questions
If there is no clear match, do not call this tool — answer conversationally instead.

Route meanings:
- /          → home / landing page
- /compare   → flight comparison search
- /simulate  → route simulator
- /airlines  → airline climate rankings
- /dashboard → user's personal impact dashboard
- /mission   → about / mission page
- /trips     → user's past trips
- /notifications → user notifications
- /profile   → user profile settings`,
  inputSchema: z.object({
    route: z
      .enum([
        "/",
        "/compare",
        "/simulate",
        "/airlines",
        "/dashboard",
        "/mission",
        "/trips",
        "/notifications",
        "/profile",
      ])
      .describe("The SkyPrint app route to navigate to"),
    reason: z.string().describe("Short human-readable reason matching the user's request"),
  }),
});

function scoreAirlineStatic(code: string) {
  const data = AIRLINE_DATA[code];
  if (!data) return null;
  const categories = computeCategories(data);
  const overallScore = computeOverallScore(categories);
  return {
    airlineCode: code,
    airlineName: data.name,
    region: data.region,
    overallScore,
    overallGrade: scoreToGrade(overallScore),
    categories,
    fleet: {
      totalAircraft: data.fleet.totalAircraft,
      averageAge: data.fleet.averageAge,
    },
    safPercent: data.safPercent,
    contrailProgramActive: data.contrailProgramActive,
  };
}

export const getAirlineRankingsTool = tool({
  description:
    "Fetch live climate rankings for ALL supported airlines: scores, grades, fleet summary, SAF adoption, contrail program status. Use when the user asks about airline rankings, comparisons across multiple airlines, who's the greenest/worst, or best-in-class examples. Returns an array sorted by overallScore descending.",
  inputSchema: z.object({
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe("Max airlines to return (defaults to all)"),
    region: z
      .enum(["North America", "Europe", "Asia Pacific", "Middle East", "Latin America", "Africa"])
      .optional()
      .describe("Filter to a single region"),
  }),
  execute: async ({ limit, region }) => {
    const all = getSupportedAirlines()
      .map(scoreAirlineStatic)
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .filter((x) => !region || x.region === region)
      .sort((a, b) => b.overallScore - a.overallScore);
    return limit ? all.slice(0, limit) : all;
  },
});

export const getAirlineDetailTool = tool({
  description:
    "Fetch the full climate profile for a SINGLE airline by IATA code (e.g. UA, DL, BA, LH, AF, EK, QF). Returns score breakdown across fleet efficiency, route optimization, contrail mitigation, and SAF adoption — plus fleet composition. Use when the user names a specific airline.",
  inputSchema: z.object({
    airlineCode: z
      .string()
      .length(2)
      .describe("Two-letter IATA airline code, e.g. UA, DL, BA"),
  }),
  execute: async ({ airlineCode }) => {
    const scored = scoreAirlineStatic(airlineCode.toUpperCase());
    if (!scored) {
      return {
        error: `Unknown airline code: ${airlineCode}. Supported codes: ${getSupportedAirlines().join(", ")}`,
      };
    }
    const data = AIRLINE_DATA[airlineCode.toUpperCase()];
    return {
      ...scored,
      fleetBreakdown: data.fleet.aircraftTypes.map((t) => ({
        type: t.type,
        count: t.count,
        fuelEfficiencyLPer100PaxKm: t.fuelEfficiency,
      })),
    };
  },
});

export const aeroTools = {
  navigate: navigateTool,
  getAirlineRankings: getAirlineRankingsTool,
  getAirlineDetail: getAirlineDetailTool,
  getImpactEquivalent: tool({
    description:
      "Convert CO2 and contrail impact into human-relatable equivalents",
    inputSchema: z.object({
      co2Kg: z.number().describe("CO2 in kilograms"),
      contrailImpactScore: z
        .number()
        .describe("Contrail impact score (0-100)"),
    }),
    execute: async ({ co2Kg, contrailImpactScore }) => {
      const trees = co2ToTrees(co2Kg);
      const carMiles = co2ToCarMiles(co2Kg);

      let contrailDescription: string;
      if (contrailImpactScore < 25) {
        contrailDescription = "minimal contrail warming effect";
      } else if (contrailImpactScore < 60) {
        contrailDescription =
          "moderate contrail warming, equivalent to adding ~50% more CO2 impact";
      } else {
        contrailDescription =
          "significant contrail warming, potentially doubling the flight's total climate impact";
      }

      return {
        co2Kg,
        treeEquivalent: trees,
        carMilesEquivalent: carMiles,
        contrailDescription,
        summary: `${co2Kg}kg CO2 = ${trees} trees absorbing for a year = driving ${carMiles} miles. Contrail effect: ${contrailDescription}.`,
      };
    },
  }),

  explainContrailRisk: tool({
    description:
      "Get a scientific explanation of contrail risk for given conditions",
    inputSchema: z.object({
      riskRating: z.enum(["low", "medium", "high"]),
      contrailProbability: z.number().describe("Probability 0-1"),
      altitudeFt: z.number().optional(),
    }),
    execute: async ({ riskRating, contrailProbability, altitudeFt }) => {
      const explanations = {
        low: "Atmospheric conditions along this route are relatively dry at cruise altitude. Contrails are unlikely to form or will dissipate quickly.",
        medium:
          "Some sections of this route pass through ice-supersaturated air. Persistent contrails may form, trapping heat for several hours.",
        high: "This route passes through extensive ice-supersaturated regions. Long-lived contrails are very likely, significantly increasing the flight's total climate impact beyond just CO2.",
      };

      return {
        explanation: explanations[riskRating],
        probability: `${Math.round(contrailProbability * 100)}% of the route is at risk`,
        altitude: altitudeFt
          ? `At FL${Math.round(altitudeFt / 100)}, conditions favor contrail persistence`
          : undefined,
      };
    },
  }),
};
