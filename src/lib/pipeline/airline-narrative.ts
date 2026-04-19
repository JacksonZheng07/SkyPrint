import type { AirlineScore } from "@/lib/types/airline";
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
