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
  return data.choices[0]?.message?.content ?? "";
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
    fleetEfficiency: number;
    routeOptimization: number;
    contrailMitigation: number;
    sustainableFuel: number;
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
- Fleet efficiency: ${context.categories.fleetEfficiency}/100 (avg age: ${context.fleetAge} years)
- Route optimization: ${context.categories.routeOptimization}/100
- Contrail mitigation: ${context.categories.contrailMitigation}/100 (program active: ${context.contrailProgramActive})
- Sustainable fuel: ${context.categories.sustainableFuel}/100 (SAF adoption: ${context.safPercent}%)

Provide a scoring narrative highlighting contrail impact as the primary differentiator.`,
    },
  ];

  return k2Chat(messages);
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
