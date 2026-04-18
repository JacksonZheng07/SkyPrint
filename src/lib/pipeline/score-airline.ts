import type { AirlineScore, FleetProfile } from "@/lib/types/airline";
import { generateAirlineNarrative } from "@/lib/clients/k2-think";

// Realistic fleet and efficiency data for major airlines
const AIRLINE_DATA: Record<
  string,
  {
    name: string;
    fleet: FleetProfile;
    safPercent: number; // sustainable aviation fuel adoption
    routeOptScore: number; // internal estimate 0-100
    contrailProgramActive: boolean;
  }
> = {
  AA: {
    name: "American Airlines",
    fleet: {
      totalAircraft: 948,
      averageAge: 12.1,
      aircraftTypes: [
        { type: "B738", count: 304, fuelEfficiency: 3.2 },
        { type: "A321", count: 219, fuelEfficiency: 2.8 },
        { type: "B77W", count: 47, fuelEfficiency: 3.5 },
        { type: "B789", count: 42, fuelEfficiency: 2.5 },
      ],
    },
    safPercent: 1.2,
    routeOptScore: 55,
    contrailProgramActive: false,
  },
  UA: {
    name: "United Airlines",
    fleet: {
      totalAircraft: 870,
      averageAge: 14.3,
      aircraftTypes: [
        { type: "B738", count: 141, fuelEfficiency: 3.2 },
        { type: "B789", count: 60, fuelEfficiency: 2.5 },
        { type: "B77W", count: 96, fuelEfficiency: 3.5 },
        { type: "A320", count: 99, fuelEfficiency: 3.0 },
      ],
    },
    safPercent: 2.1,
    routeOptScore: 62,
    contrailProgramActive: true,
  },
  DL: {
    name: "Delta Air Lines",
    fleet: {
      totalAircraft: 895,
      averageAge: 15.8,
      aircraftTypes: [
        { type: "B738", count: 77, fuelEfficiency: 3.2 },
        { type: "A321", count: 127, fuelEfficiency: 2.8 },
        { type: "A332", count: 31, fuelEfficiency: 3.3 },
        { type: "A359", count: 37, fuelEfficiency: 2.4 },
      ],
    },
    safPercent: 1.5,
    routeOptScore: 58,
    contrailProgramActive: false,
  },
  BA: {
    name: "British Airways",
    fleet: {
      totalAircraft: 254,
      averageAge: 13.5,
      aircraftTypes: [
        { type: "A320", count: 67, fuelEfficiency: 3.0 },
        { type: "A359", count: 18, fuelEfficiency: 2.4 },
        { type: "B77W", count: 43, fuelEfficiency: 3.5 },
        { type: "B789", count: 12, fuelEfficiency: 2.5 },
      ],
    },
    safPercent: 0.8,
    routeOptScore: 50,
    contrailProgramActive: false,
  },
  LH: {
    name: "Lufthansa",
    fleet: {
      totalAircraft: 284,
      averageAge: 11.2,
      aircraftTypes: [
        { type: "A320", count: 68, fuelEfficiency: 3.0 },
        { type: "A321", count: 57, fuelEfficiency: 2.8 },
        { type: "A359", count: 21, fuelEfficiency: 2.4 },
        { type: "B789", count: 8, fuelEfficiency: 2.5 },
      ],
    },
    safPercent: 1.8,
    routeOptScore: 65,
    contrailProgramActive: true,
  },
};

export async function scoreAirline(airlineCode: string): Promise<AirlineScore> {
  const data = AIRLINE_DATA[airlineCode.toUpperCase()];
  if (!data) {
    throw new Error(`Unknown airline: ${airlineCode}. Supported: ${Object.keys(AIRLINE_DATA).join(", ")}`);
  }

  // Fleet efficiency: weighted average fuel efficiency, penalize old fleets
  const totalCount = data.fleet.aircraftTypes.reduce((s, t) => s + t.count, 0);
  const avgEfficiency =
    data.fleet.aircraftTypes.reduce(
      (s, t) => s + t.fuelEfficiency * t.count,
      0
    ) / totalCount;
  // Lower fuel efficiency number = better. Best ~2.4, worst ~3.8
  const fleetEfficiency = Math.max(0, Math.min(100, ((3.8 - avgEfficiency) / 1.4) * 80 + (16 - data.fleet.averageAge) * 2));

  // Contrail mitigation: active program = big bonus
  const contrailMitigation = data.contrailProgramActive ? 65 : 25;

  // Sustainable fuel adoption
  const sustainableFuel = Math.min(100, data.safPercent * 20);

  const routeOptimization = data.routeOptScore;

  // Overall weighted score
  const overallScore = Math.round(
    fleetEfficiency * 0.3 +
      routeOptimization * 0.25 +
      contrailMitigation * 0.3 +
      sustainableFuel * 0.15
  );

  const overallGrade = scoreToGrade(overallScore);

  // Try K2 Think V2 for narrative, fall back to local generation
  let narrative: string;
  try {
    narrative = await generateAirlineNarrative({
      airlineName: data.name,
      airlineCode: airlineCode.toUpperCase(),
      overallGrade,
      overallScore,
      categories: {
        fleetEfficiency: Math.round(fleetEfficiency),
        routeOptimization: Math.round(routeOptimization),
        contrailMitigation: Math.round(contrailMitigation),
        sustainableFuel: Math.round(sustainableFuel),
      },
      fleetAge: data.fleet.averageAge,
      contrailProgramActive: data.contrailProgramActive,
      safPercent: data.safPercent,
    });
  } catch {
    narrative = generateLocalNarrative(data.name, overallGrade, {
      fleetEfficiency: Math.round(fleetEfficiency),
      routeOptimization: Math.round(routeOptimization),
      contrailMitigation: Math.round(contrailMitigation),
      sustainableFuel: Math.round(sustainableFuel),
    }, data);
  }

  return {
    airlineCode: airlineCode.toUpperCase(),
    airlineName: data.name,
    overallGrade,
    overallScore,
    categories: {
      fleetEfficiency: Math.round(fleetEfficiency),
      routeOptimization: Math.round(routeOptimization),
      contrailMitigation: Math.round(contrailMitigation),
      sustainableFuel: Math.round(sustainableFuel),
    },
    narrative,
    fleetProfile: data.fleet,
  };
}

function scoreToGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "F";
}

function generateLocalNarrative(
  name: string,
  grade: string,
  categories: AirlineScore["categories"],
  data: (typeof AIRLINE_DATA)[string]
): string {
  const parts: string[] = [];

  parts.push(
    `${name} receives an overall grade of ${grade} for environmental performance.`
  );

  if (categories.fleetEfficiency >= 60) {
    parts.push(
      `The fleet shows strong fuel efficiency with an average age of ${data.fleet.averageAge} years.`
    );
  } else {
    parts.push(
      `Fleet modernization is a key area for improvement — the average aircraft age is ${data.fleet.averageAge} years.`
    );
  }

  if (data.contrailProgramActive) {
    parts.push(
      "Notably, the airline has an active contrail mitigation program, which significantly reduces non-CO2 climate impact."
    );
  } else {
    parts.push(
      "The airline has not yet adopted contrail-aware flight planning, missing a major opportunity to reduce total climate impact."
    );
  }

  if (data.safPercent > 1.5) {
    parts.push(
      `Sustainable aviation fuel adoption at ${data.safPercent}% is above the industry average.`
    );
  }

  return parts.join(" ");
}

/** Get all supported airline codes */
export function getSupportedAirlines(): string[] {
  return Object.keys(AIRLINE_DATA);
}

/** Score all airlines and return sorted by score (descending) */
export async function getAllAirlineScores(): Promise<AirlineScore[]> {
  const codes = getSupportedAirlines();
  const scores = await Promise.all(codes.map((code) => scoreAirline(code)));
  return scores.sort((a, b) => b.overallScore - a.overallScore);
}
