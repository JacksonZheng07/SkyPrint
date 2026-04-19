/**
 * K2 Think V2 API client — MBZUAI reasoning model for airline scoring and report generation.
 */

interface K2ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface K2ChatResponse {
  id: string;
  choices: {
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
  }[];
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

const K2_BASE_URL = process.env.K2_THINK_BASE_URL ?? "https://api.k2think.ai/v1";
const K2_MODEL = "MBZUAI-IFM/K2-Think-v2";

async function k2Chat(messages: K2ChatMessage[]): Promise<string> {
  const apiKey = process.env.K2_THINK_API_KEY;
  if (!apiKey) {
    throw new Error("K2_THINK_API_KEY not configured");
  }

  const res = await fetch(`${K2_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    body: JSON.stringify({
      model: K2_MODEL,
      messages,
      stream: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`K2 Think API error ${res.status}: ${text}`);
  }

  const data: K2ChatResponse = await res.json();
  return stripReasoning(data.choices[0]?.message?.content ?? "");
}

function stripReasoning(content: string): string {
  const closeIdx = content.lastIndexOf("</think>");
  return (closeIdx >= 0 ? content.slice(closeIdx + "</think>".length) : content).trim();
}

/**
 * Generate a detailed airline environmental narrative using K2 Think reasoning.
 */
export async function generateAirlineNarrative(context: {
  airlineName: string;
  airlineCode: string;
  overallGrade: string;
  overallScore: number;
  categories: {
    contrailMitigation: number;
    fleetEfficiency: number;
    sustainableFuel: number;
    routeOptimization: number;
    emissionsTrajectory: number;
  };
  fleetAge: number;
  contrailProgramActive: boolean;
  safPercent: number;
}): Promise<string> {
  const messages: K2ChatMessage[] = [
    {
      role: "system",
      content:
        "You are an aviation environmental analyst. Generate a concise, insightful narrative about an airline's environmental performance. Focus on contrail impact (the largest non-CO2 warming factor), fleet efficiency, and actionable improvements. Be specific with numbers. Keep it to 3-4 sentences.",
    },
    {
      role: "user",
      content: `Analyze ${context.airlineName} (${context.airlineCode}):
- Overall grade: ${context.overallGrade} (${context.overallScore}/100)
- Contrail avoidance: ${context.categories.contrailMitigation}/100 (30% weight, program active: ${context.contrailProgramActive})
- Fleet efficiency: ${context.categories.fleetEfficiency}/100 (25% weight, avg age: ${context.fleetAge} years)
- SAF adoption: ${context.categories.sustainableFuel}/100 (20% weight, ${context.safPercent}% of fuel)
- Route optimization: ${context.categories.routeOptimization}/100 (15% weight)
- Emissions trajectory: ${context.categories.emissionsTrajectory}/100 (10% weight)

Provide a scoring narrative highlighting contrail impact as the primary differentiator.`,
    },
  ];

  return k2Chat(messages);
}

/**
 * Generate a structured full report for an airline's environmental performance.
 * Returns JSON with sections: executive summary, contrail analysis, fleet assessment,
 * SAF outlook, recommendations, and a climate grade justification.
 */
export async function generateAirlineFullReport(context: {
  airlineName: string;
  airlineCode: string;
  overallGrade: string;
  overallScore: number;
  tier: string;
  categories: {
    contrailMitigation: number;
    fleetEfficiency: number;
    sustainableFuel: number;
    routeOptimization: number;
    emissionsTrajectory: number;
  };
  fleetAge: number;
  totalAircraft: number;
  aircraftTypes: { type: string; count: number; fuelEfficiency: number }[];
  contrailProgramActive: boolean;
  safPercent: number;
}): Promise<{
  executiveSummary: string;
  contrailAnalysis: string;
  fleetAssessment: string;
  safOutlook: string;
  recommendations: string[];
  gradeJustification: string;
}> {
  const fleetBreakdown = context.aircraftTypes
    .map((a) => `${a.type}: ${a.count} aircraft (${a.fuelEfficiency} L/100pax-km)`)
    .join(", ");

  const messages: K2ChatMessage[] = [
    {
      role: "system",
      content: `You are an aviation climate scientist writing an in-depth airline environmental assessment. You have deep expertise in:
- Contrail climatology: contrails cause 35-57% of aviation's total warming effect (Lee et al., 2021). Night flights produce contrails with 3x more warming than daytime flights due to absent shortwave cooling offset.
- Fleet efficiency: newer-generation aircraft (A350, B787, A220) achieve 2.3-2.5 L/100pax-km vs. legacy widebodies (B777, A380) at 3.5-3.8 L/100pax-km.
- SAF impact: current SAF blends reduce lifecycle CO₂ by 50-80% and reduce soot particle emissions by ~70%, directly reducing contrail formation.

Return ONLY valid JSON with these exact keys:
{
  "executiveSummary": "2-3 sentences — high-level climate grade justification",
  "contrailAnalysis": "2-3 sentences — contrail risk assessment for this airline's operations",
  "fleetAssessment": "2-3 sentences — fleet modernization and efficiency evaluation",
  "safOutlook": "2-3 sentences — SAF adoption trajectory and impact",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "gradeJustification": "1-2 sentences — why this specific grade is earned, referencing category scores"
}`,
    },
    {
      role: "user",
      content: `Full environmental assessment for ${context.airlineName} (${context.airlineCode}):

GRADE: ${context.overallGrade} (${context.overallScore}/100) — Tier: "${context.tier}"

CATEGORY SCORES (weighted):
• Contrail Avoidance: ${context.categories.contrailMitigation}/100 (30% weight) — Program active: ${context.contrailProgramActive}
• Fleet Efficiency: ${context.categories.fleetEfficiency}/100 (25% weight) — Avg fleet age: ${context.fleetAge}y, ${context.totalAircraft} aircraft
• SAF Adoption: ${context.categories.sustainableFuel}/100 (20% weight) — ${context.safPercent}% of total fuel
• Route Optimization: ${context.categories.routeOptimization}/100 (15% weight)
• Emissions Trajectory: ${context.categories.emissionsTrajectory}/100 (10% weight)

FLEET COMPOSITION: ${fleetBreakdown}

Generate a thorough, data-driven assessment. Reference specific aircraft types by name. Be concrete about contrail science — mention night vs. daytime impact. For recommendations, focus on highest-impact interventions.`,
    },
  ];

  const raw = await k2Chat(messages);
  try {
    return JSON.parse(raw);
  } catch {
    // Fallback: extract JSON from the response if wrapped in markdown
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    // Ultimate fallback
    return {
      executiveSummary: raw.slice(0, 300),
      contrailAnalysis: `${context.airlineName} ${context.contrailProgramActive ? "operates an active contrail avoidance program, reducing non-CO₂ warming by an estimated 20-30%." : "has no contrail avoidance program — contrails from its fleet may cause 2-3x more warming than its direct CO₂ emissions."}`,
      fleetAssessment: `Fleet of ${context.totalAircraft} aircraft with average age ${context.fleetAge} years. ${context.fleetAge < 10 ? "Modern fleet with newer-generation fuel-efficient aircraft." : "Fleet modernization would improve both fuel efficiency and contrail characteristics."}`,
      safOutlook: `Current SAF adoption at ${context.safPercent}% of total fuel. ${context.safPercent >= 0.5 ? "Above industry average — SAF reduces both CO₂ lifecycle emissions and soot-driven contrail formation." : "Below leading airlines — increasing SAF blend would reduce both carbon footprint and contrail persistence."}`,
      recommendations: [
        context.contrailProgramActive ? "Expand contrail avoidance to cover all long-haul night flights" : "Implement contrail avoidance program — highest-impact climate intervention per dollar",
        context.fleetAge > 12 ? "Accelerate fleet renewal with A350/B787 family aircraft" : "Continue fleet modernization path",
        `Increase SAF adoption from ${context.safPercent}% toward 5% target`,
      ],
      gradeJustification: `${context.airlineName} earns a ${context.overallGrade} grade (${context.overallScore}/100) based on ${context.contrailProgramActive ? "strong" : "weak"} contrail mitigation and ${context.safPercent >= 0.5 ? "above-average" : "below-average"} SAF adoption.`,
    };
  }
}

/**
 * Generate a government-ready environmental report for an airline.
 */
export async function generateEnvironmentalReport(context: {
  airlineName: string;
  airlineCode: string;
  period: string;
  totalFlights: number;
  totalCo2Kg: number;
  co2SavedKg: number;
  contrailsAvoided: number;
  safUsagePercent: number;
}): Promise<string> {
  const messages: K2ChatMessage[] = [
    {
      role: "system",
      content:
        "You are an environmental compliance report writer. Generate a structured report suitable for government submission regarding aviation environmental improvements. Include specific metrics, contrail avoidance data, and carbon reduction achievements. Format with clear sections.",
    },
    {
      role: "user",
      content: `Generate an environmental compliance report for ${context.airlineName} (${context.airlineCode}):
Period: ${context.period}
Total flights: ${context.totalFlights}
Total CO2: ${(context.totalCo2Kg / 1000).toFixed(1)} tonnes
CO2 saved via optimization: ${(context.co2SavedKg / 1000).toFixed(1)} tonnes
Contrails avoided: ${context.contrailsAvoided} flight segments
SAF usage: ${context.safUsagePercent}%

Format as a professional report for tax deduction / environmental stipend applications.`,
    },
  ];

  return k2Chat(messages);
}

/**
 * Generate a non-profit targeting report identifying airlines to advocate for change.
 */
export async function generateNonProfitReport(airlines: {
  code: string;
  name: string;
  grade: string;
  score: number;
  contrailMitigation: number;
  safPercent: number;
}[]): Promise<string> {
  const messages: K2ChatMessage[] = [
    {
      role: "system",
      content:
        "You are an environmental advocacy analyst. Generate a report for non-profit organizations identifying which airlines should be targeted for environmental improvement advocacy. Focus on contrail mitigation as the highest-impact intervention. Be data-driven and constructive.",
    },
    {
      role: "user",
      content: `Analyze these airlines and recommend advocacy targets:
${airlines.map((a) => `- ${a.name} (${a.code}): Grade ${a.grade}, Score ${a.score}/100, Contrail mitigation: ${a.contrailMitigation}/100, SAF: ${a.safPercent}%`).join("\n")}

Identify top advocacy targets and explain why contrail avoidance is the most cost-effective environmental intervention per dollar.`,
    },
  ];

  return k2Chat(messages);
}
