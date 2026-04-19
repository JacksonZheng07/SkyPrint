import type { AirlineScore, AirlineReport } from "@/lib/types/airline";
import type { AirlineStaticData } from "./airline-data";

const FLEET_EFFICIENCY_THRESHOLD = 60;
const SAF_ABOVE_AVERAGE_THRESHOLD = 1.5;

/** Fallback narrative used when the upstream AI provider fails. */
export function buildLocalNarrative(
  data: AirlineStaticData,
  grade: string,
  categories: AirlineScore["categories"],
): string {
  const parts: string[] = [
    `${data.name} receives an overall grade of ${grade} for environmental performance.`,
  ];

  parts.push(
    categories.fleetEfficiency >= FLEET_EFFICIENCY_THRESHOLD
      ? `The fleet shows strong fuel efficiency with an average age of ${data.fleet.averageAge} years.`
      : `Fleet modernization is a key area for improvement — the average aircraft age is ${data.fleet.averageAge} years.`,
  );

  parts.push(
    data.contrailProgramActive
      ? "Notably, the airline has an active contrail mitigation program, which significantly reduces non-CO2 climate impact."
      : "The airline has not yet adopted contrail-aware flight planning, missing a major opportunity to reduce total climate impact.",
  );

  if (data.safPercent > SAF_ABOVE_AVERAGE_THRESHOLD) {
    parts.push(
      `Sustainable aviation fuel adoption at ${data.safPercent}% is above the industry average.`,
    );
  }

  return parts.join(" ");
}

/** Deterministic fallback report when K2 is unavailable. */
export function buildLocalReport(
  data: AirlineStaticData,
  grade: string,
  score: number,
  categories: AirlineScore["categories"],
  tier: string,
): AirlineReport {
  const catEntries = Object.entries(categories) as [string, number][];
  const sorted = [...catEntries].sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const catLabels: Record<string, string> = {
    contrailMitigation: "contrail avoidance",
    fleetEfficiency: "fleet efficiency",
    sustainableFuel: "SAF adoption",
    routeOptimization: "route optimization",
    emissionsTrajectory: "emissions trajectory",
  };

  const executiveSummary = `${data.name} earns a ${grade} grade (${score}/100), placing it in the "${tier}" tier. Its strongest area is ${catLabels[strongest[0]]} (${strongest[1]}/100), while ${catLabels[weakest[0]]} (${weakest[1]}/100) represents the biggest opportunity for improvement.`;

  const contrailAnalysis = data.contrailProgramActive
    ? `${data.name} operates an active contrail avoidance program, which is the single highest-impact climate intervention available to airlines. Contrails cause 35-57% of aviation's total warming effect (Lee et al., 2021), and active avoidance can reduce this by 20-30%. Night flights produce contrails with 3x more warming than daytime flights, making operational routing during these hours especially critical.`
    : `${data.name} does not currently operate a contrail avoidance program. This is a significant missed opportunity — contrails cause 35-57% of aviation's total warming effect, often exceeding the impact of direct CO₂ emissions. Night flights are particularly problematic, producing contrails with 3x more warming due to the absence of shortwave cooling. Implementing contrail-aware routing would be the single most impactful climate action the airline could take.`;

  const avgEff = data.fleet.aircraftTypes.reduce((s, t) => s + t.fuelEfficiency * t.count, 0)
    / data.fleet.aircraftTypes.reduce((s, t) => s + t.count, 0);
  const fleetAssessment = `${data.name} operates ${data.fleet.totalAircraft} aircraft with an average age of ${data.fleet.averageAge} years and a fleet-weighted fuel efficiency of ${avgEff.toFixed(1)} L/100pax-km. ${
    data.fleet.averageAge < 10
      ? "This is a modern fleet with newer-generation aircraft that benefit from improved aerodynamics and engine technology."
      : data.fleet.averageAge < 13
        ? "The fleet is approaching mid-life — continued renewal with next-generation aircraft (A350, B787, A220) would improve both fuel burn and contrail characteristics."
        : "The aging fleet represents a significant efficiency drag. Accelerating replacement with modern widebodies could reduce fuel consumption by 15-25% per seat."
  }`;

  const safOutlook = data.safPercent >= 0.5
    ? `At ${data.safPercent}% SAF adoption, ${data.name} is above the industry average. SAF reduces lifecycle CO₂ by 50-80% and, critically, reduces soot particle emissions by ~70%, which directly decreases contrail formation and persistence. Continued scaling toward 5% would place the airline among global leaders.`
    : `Current SAF adoption stands at ${data.safPercent}%, which is ${data.safPercent > 0 ? "below" : "well below"} industry leaders (0.5-1.2%). Increasing SAF blend ratios is a dual-benefit intervention: it reduces both lifecycle carbon emissions and soot-driven contrail formation. Even modest increases to 0.5% would meaningfully improve the airline's climate profile.`;

  const recommendations: string[] = [];
  if (!data.contrailProgramActive) {
    recommendations.push("Implement a contrail avoidance program — this is the highest-impact climate intervention per dollar, with potential to reduce total warming contribution by 20-30%.");
  } else {
    recommendations.push("Expand contrail avoidance coverage to all long-haul night flights, where warming impact is 3x higher than daytime operations.");
  }
  if (data.fleet.averageAge > 12) {
    recommendations.push(`Accelerate fleet renewal — replacing older aircraft with A350/B787 family types could reduce per-seat fuel burn by 15-25% and lower soot emissions.`);
  } else {
    recommendations.push("Continue fleet modernization path, prioritizing next-generation narrowbodies (A321neo, B737 MAX) for short-haul routes.");
  }
  recommendations.push(`Increase SAF adoption from ${data.safPercent}% toward the 5% near-term target — each percentage point reduces lifecycle emissions and contrail persistence.`);

  const gradeJustification = `${data.name} earns ${grade} (${score}/100) primarily due to ${strongest[1] >= 70 ? "strong" : "moderate"} performance in ${catLabels[strongest[0]]} and ${weakest[1] < 40 ? "weak" : "average"} performance in ${catLabels[weakest[0]]}. ${
    data.contrailProgramActive
      ? "The active contrail program is the single biggest score driver, contributing heavily to the 30%-weighted contrail avoidance category."
      : "The lack of a contrail avoidance program significantly limits the overall score, as this category carries the highest weight at 30%."
  }`;

  return {
    executiveSummary,
    contrailAnalysis,
    fleetAssessment,
    safOutlook,
    recommendations,
    gradeJustification,
  };
}
