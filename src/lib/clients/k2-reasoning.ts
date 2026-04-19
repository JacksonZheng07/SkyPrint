/**
 * K2 Think V2 structured reasoning — core intelligence layer for SkyPrint.
 *
 * Design philosophy: K2 is a *reasoning* model, not a calculator. We feed it
 * real reference tables, scientific constants, and domain context so it can
 * think through factor interactions that simple formulas miss — then return
 * structured JSON. Local fallbacks mirror the same logic deterministically.
 */

interface K2ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface K2ChatResponse {
  id: string;
  choices: { index: number; message: { role: string; content: string }; finish_reason: string }[];
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

const K2_BASE_URL = process.env.K2_THINK_BASE_URL ?? "https://api.k2think.ai/v1";
const K2_MODEL = "MBZUAI-IFM/K2-Think-v2";

async function k2ChatJSON<T>(messages: K2ChatMessage[], fallback: T): Promise<T> {
  const apiKey = process.env.K2_THINK_API_KEY;
  if (!apiKey) return fallback;

  try {
    const res = await fetch(`${K2_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      body: JSON.stringify({ model: K2_MODEL, messages, stream: false }),
    });

    if (!res.ok) return fallback;

    const data: K2ChatResponse = await res.json();
    const raw = data.choices[0]?.message?.content ?? "";

    // Strip <think> reasoning tags — we only need the final answer
    const closeIdx = raw.lastIndexOf("</think>");
    const content = (closeIdx >= 0 ? raw.slice(closeIdx + "</think>".length) : raw).trim();

    // Extract JSON from markdown code blocks or raw
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) ?? content.match(/(\{[\s\S]*\})/);
    if (!jsonMatch) return fallback;

    return JSON.parse(jsonMatch[1].trim()) as T;
  } catch {
    return fallback;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   REFERENCE DATA — embedded in prompts so K2 can reason with real numbers
   ═══════════════════════════════════════════════════════════════════════════ */

const AIRCRAFT_REFERENCE = `
AIRCRAFT FUEL EFFICIENCY TABLE (L / 100 pax-km, lower = better):
| Type    | Efficiency | Seats | Engine Gen | Soot Index |
|---------|-----------|-------|------------|------------|
| A220    | 2.3       | 130   | GTF        | Very Low   |
| A320neo | 2.5       | 180   | LEAP/GTF   | Low        |
| A321neo | 2.4       | 220   | LEAP/GTF   | Low        |
| B737MAX | 2.5       | 180   | LEAP-1B    | Low        |
| B787-9  | 2.5       | 290   | GEnx/RR    | Low        |
| A350-900| 2.4       | 325   | XWB        | Low        |
| A350-1K | 2.3       | 366   | XWB        | Low        |
| B777X   | 2.6       | 384   | GE9X       | Low        |
| A320ceo | 3.0       | 170   | CFM56/V2500| Medium     |
| B737-800| 3.2       | 162   | CFM56      | Medium     |
| B737-900| 3.1       | 177   | CFM56      | Medium     |
| A321ceo | 2.8       | 200   | CFM56/V2500| Medium     |
| B777-300ER| 3.5     | 396   | GE90       | High       |
| A330-200| 3.3       | 247   | CF6/RR     | High       |
| A330-300| 3.3       | 277   | CF6/RR     | High       |
| A330neo | 2.9       | 260   | RR Trent7k | Medium     |
| A380    | 3.8       | 555   | GP7200/RR  | High       |
| B747-400| 4.2       | 416   | CF6        | Very High  |
| E190    | 3.4       | 97    | CF34       | High       |

KEY INSIGHT: Soot Index directly correlates with contrail ice crystal nucleation.
Lower soot = fewer but larger ice crystals = shorter-lived contrails = less warming.
New-gen engines (GTF, LEAP, GEnx, XWB) produce 50-80% fewer soot particles.`;

const CONTRAIL_SCIENCE = `
CONTRAIL CLIMATE SCIENCE REFERENCE:
1. Formation: Contrails form when the Schmidt-Appleman Criterion (SAC) is met:
   - Ambient temperature < -40°C (typical above FL300/30,000ft)
   - Relative humidity over ice (RHi) > 100% → persistent contrails
   - RHi < 100% → contrails dissipate in seconds (negligible impact)

2. Warming mechanism:
   - Contrails trap outgoing longwave radiation (warming, always present)
   - Contrails reflect incoming shortwave radiation (cooling, daytime only)
   - NET EFFECT depends on time of day:
     * Night flights (18:00-06:00 UTC): ONLY warming (no solar reflection) → 3-5x worse
     * Day flights with high solar angle: partial offset, net warming ~40-60% of night
     * Dawn/dusk (06:00-08:00, 16:00-18:00): minimal solar offset → ~80% of night warming

3. Persistence impact (exponential, not linear):
   - < 30 min: negligible climate impact
   - 1-2 hours: moderate — spreads into thin cirrus
   - 3-4 hours: significant — becomes contrail cirrus covering 100s of km²
   - 5-6+ hours: severe — effectively becomes artificial cloud deck

4. Radiative forcing benchmarks:
   - < 0.5 mW/m²: negligible
   - 0.5-2.0 mW/m²: moderate
   - 2.0-5.0 mW/m²: significant
   - > 5.0 mW/m²: severe (comparable to CO₂ forcing for that flight segment)

5. Aircraft engine effect on contrails:
   - Old engines (CFM56, CF6, GE90): High soot → many small ice crystals → longer-lived, optically thicker contrails
   - New engines (LEAP, GTF, GEnx, XWB): Low soot → fewer, larger ice crystals → shorter-lived, optically thinner
   - Estimated reduction: new-gen engines reduce contrail climate impact by 30-50%

6. Route coverage matters:
   - If >50% of waypoints form persistent contrails → flight traverses a large ice-supersaturated region
   - If <20% → isolated pockets, altitude adjustment of ±2000ft could eliminate most contrails`;

const CO2_SCIENCE = `
CO₂ EMISSION SCIENCE REFERENCE:
1. Jet A-1 fuel properties:
   - Density: 0.804 kg/L (varies 0.775-0.840)
   - CO₂ emission factor: 3.16 kg CO₂ per kg fuel burned
   - Per liter: 3.16 × 0.804 = 2.54 kg CO₂/L

2. ICAO Carbon Emissions Calculator methodology:
   - Base fuel burn = fuel_efficiency(L/100pax-km) × distance(km) / 100
   - Correction factors:
     * Taxi/ground operations: +3-5% (short-haul ~5%, long-haul ~3%)
     * Climb/descent inefficiency: +8-12% (short-haul higher due to climb/total ratio)
     * Wind and routing: +2-5% (headwind corridors like NATL add more)
     * Load factor adjustment: base assumes 82% load; actual_co2 = base × (0.82 / actual_load_factor)

3. Per-passenger benchmarks (economy class, 82% load):
   | Route Type      | Distance   | Typical CO₂/pax |
   |-----------------|-----------|-----------------|
   | Short-haul      | <1500 km  | 80-150 kg       |
   | Medium-haul     | 1500-4000 | 150-350 kg      |
   | Long-haul       | 4000-8000 | 350-700 kg      |
   | Ultra-long-haul | >8000 km  | 700-1200 kg     |

4. The 2.31 vs 2.54 question:
   - 2.31 kg CO₂/L is often cited but uses a LOWER density assumption (0.73 kg/L)
   - 2.54 kg CO₂/L uses the ICAO standard density (0.804 kg/L)
   - We use 2.54 for accuracy, matching ICAO methodology`;

const AIRLINE_SCORING_RUBRIC = `
AIRLINE ENVIRONMENTAL SCORING RUBRIC:

Category 1: CONTRAIL AVOIDANCE (30% weight — SkyPrint's core thesis)
Scoring guide:
- 80-100: Active program with research partner (e.g., UA + Google/Breakthrough Energy, BA + NATS)
         AND measurable flight diversions happening regularly
- 60-79:  Formal contrail program announced, early-stage trials
- 40-59:  Research participation or signed intent, no operational changes yet
- 20-39:  General awareness, mentioned in sustainability report, no program
- 0-19:   No mention, no awareness, actively dismissive

Category 2: FUEL EFFICIENCY (25% weight)
Based on fleet-weighted average L/100pax-km:
- 90-100: ≤2.3 (A220-dominated, A350-1000)
- 70-89:  2.3-2.6 (modern narrowbody + widebody mix)
- 50-69:  2.6-3.0 (mixed fleet, some legacy)
- 30-49:  3.0-3.3 (older fleet, heavy B737-800/A320ceo)
- 0-29:   >3.3 (legacy widebodies, A380, B747)
Fleet age modifier: subtract 1 point per year above 12y average, add 1 per year below 10y

Category 3: SAF ADOPTION (20% weight)
- 90-100: >5% of total fuel (world-leading)
- 70-89:  2-5% (above industry average of ~0.5%)
- 50-69:  0.5-2% (at industry average)
- 30-49:  0.1-0.5% (below average but present)
- 0-29:   <0.1% or none

Category 4: ROUTE OPTIMIZATION (15% weight)
Based on operational efficiency indicators:
- High utilization, point-to-point efficiency, modern dispatch systems
- Hub congestion penalties, circuitous routing patterns
- Given as a pre-computed score from operational data

Category 5: EMISSIONS TRAJECTORY (10% weight)
- 80-100: Measurably declining emissions intensity YoY + active programs
- 60-79:  New fleet orders suggest improvement, some programs active
- 40-59:  Flat — no clear improvement trend
- 20-39:  Growing capacity without efficiency gains
- 0-19:   Worsening intensity, no mitigation plans

TIER LABELS:
- 75+: "Sky Saints" — industry leaders actively reducing climate impact
- 60-74: "Clean Cruisers" — above average with clear positive trajectory
- 45-59: "Middle of the Pack" — industry average, incremental improvements
- 30-44: "Greenwash Gold Medalists" — talk > action, lagging peers
- <30: "Contrail Criminals" — bottom of industry, no meaningful action`;

/* ═══════════════════════════════════════════════════════════════════════════
   CO₂ ESTIMATION
   ═══════════════════════════════════════════════════════════════════════════ */

export interface CO2Estimate {
  co2Kg: number;
  fuelBurnL: number;
  methodology: string;
}

export async function k2EstimateCO2(params: {
  aircraftType: string;
  distanceKm: number;
  fuelEfficiencyLPer100PaxKm: number;
  loadFactor?: number;
}): Promise<CO2Estimate> {
  const { aircraftType, distanceKm, fuelEfficiencyLPer100PaxKm, loadFactor = 0.82 } = params;

  // Local fallback: ICAO methodology with correction factors
  const isShortHaul = distanceKm < 1500;
  const taxiOverhead = isShortHaul ? 1.05 : 1.03;
  const climbOverhead = isShortHaul ? 1.12 : 1.08;
  const routingOverhead = 1.03;
  const loadAdjustment = 0.82 / loadFactor;

  const baseFuelL = (fuelEfficiencyLPer100PaxKm * distanceKm) / 100;
  const adjustedFuelL = baseFuelL * taxiOverhead * climbOverhead * routingOverhead * loadAdjustment;
  const co2Kg = adjustedFuelL * 2.54; // ICAO standard: 3.16 kg CO₂/kg × 0.804 kg/L

  const localFallback: CO2Estimate = {
    co2Kg: Math.round(co2Kg),
    fuelBurnL: Math.round(adjustedFuelL),
    methodology: `ICAO method: ${fuelEfficiencyLPer100PaxKm} L/100pax-km × ${distanceKm}km, corrected for taxi(${isShortHaul ? "5" : "3"}%), climb(${isShortHaul ? "12" : "8"}%), routing(3%), load(${(loadFactor * 100).toFixed(0)}%), emission factor 2.54 kg CO₂/L`,
  };

  return k2ChatJSON<CO2Estimate>(
    [
      {
        role: "system",
        content: `You are an aviation emissions scientist. Your job is to calculate per-passenger CO₂ emissions with ICAO-grade accuracy.

${CO2_SCIENCE}

${AIRCRAFT_REFERENCE}

INSTRUCTIONS:
1. Look up the aircraft type in the reference table to verify the given fuel efficiency
2. Apply ALL correction factors: taxi/ground, climb/descent, wind/routing, load factor
3. Use the correct CO₂ emission factor (2.54 kg CO₂/L for Jet A-1 at standard density)
4. Cross-check your result against the per-passenger benchmarks for the route distance
5. If your result seems off (>50% deviation from benchmark), re-examine your calculation

Think through each step carefully. Show your reasoning in <think> tags.

Return ONLY valid JSON after your reasoning:
{"co2Kg": number, "fuelBurnL": number, "methodology": "describe the calculation steps and factors applied"}`,
      },
      {
        role: "user",
        content: `Calculate per-passenger CO₂ for this flight:
- Aircraft: ${aircraftType}
- Great-circle distance: ${distanceKm} km (${isShortHaul ? "short" : distanceKm < 4000 ? "medium" : "long"}-haul)
- Published fuel efficiency for this type: ${fuelEfficiencyLPer100PaxKm} L/100pax-km
- Cabin load factor: ${(loadFactor * 100).toFixed(0)}%

Remember to apply taxi, climb, routing, and load corrections. Cross-check against benchmarks.`,
      },
    ],
    localFallback,
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONTRAIL IMPACT SCORING
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ContrailImpactResult {
  impactScore: number; // 0-100
  riskRating: "low" | "medium" | "high";
  reasoning: string;
}

export async function k2ScoreContrailImpact(params: {
  formationProbability: number;
  radiativeForcingWM2: number;
  persistenceHours: number;
  departureHourUTC: number;
  aircraftType: string;
  persistentWaypoints: number;
  totalWaypoints: number;
}): Promise<ContrailImpactResult> {
  const {
    formationProbability: prob,
    radiativeForcingWM2: rf,
    persistenceHours,
    departureHourUTC: depHour,
    aircraftType,
    persistentWaypoints,
    totalWaypoints,
  } = params;

  // ── Local fallback with science-grounded formula ──
  // Engine generation soot factor
  const newGenTypes = ["B789", "A359", "A35K", "A321", "A320", "A220", "B78X"];
  const oldGenTypes = ["B77W", "A332", "A333", "A388", "B744"];
  const sootFactor = newGenTypes.includes(aircraftType)
    ? 0.65 // 35% reduction in contrail impact
    : oldGenTypes.includes(aircraftType)
      ? 1.15
      : 1.0;

  // Time-of-day: night is worst (no SW cooling offset)
  const nightFactor =
    depHour >= 18 || depHour < 6
      ? 1.4 // pure LW warming
      : depHour >= 6 && depHour < 8 || depHour >= 16 && depHour < 18
        ? 1.15 // dawn/dusk, minimal offset
        : 0.75; // daytime, partial SW cooling offset

  // Persistence: exponential impact (science says so)
  const persistenceScore =
    persistenceHours < 0.5
      ? 0
      : persistenceHours < 2
        ? persistenceHours * 8
        : persistenceHours < 4
          ? 16 + (persistenceHours - 2) * 12
          : 40 + (persistenceHours - 4) * 15;

  // Route coverage: what fraction of the route has persistent contrails
  const coverageRatio = totalWaypoints > 0 ? persistentWaypoints / totalWaypoints : 0;
  const coverageFactor = 0.5 + coverageRatio; // 0.5 to 1.5

  // Radiative forcing component (benchmarked against science reference)
  const rfMw = Math.abs(rf) * 1000; // convert to mW/m²
  const rfScore =
    rfMw < 0.5 ? rfMw * 10
    : rfMw < 2.0 ? 5 + (rfMw - 0.5) * 15
    : rfMw < 5.0 ? 27.5 + (rfMw - 2.0) * 10
    : 57.5 + Math.min(42.5, (rfMw - 5.0) * 5);

  // Formation probability component
  const probScore = prob * 40; // 0-40 range

  // Combine: formation drives base, RF and persistence amplify, soot/time/coverage modulate
  const rawScore = (probScore + rfScore * 0.4 + persistenceScore * 0.3) * sootFactor * nightFactor * coverageFactor;
  const impactScore = Math.min(100, Math.max(0, Math.round(rawScore)));
  const riskRating: "low" | "medium" | "high" =
    impactScore < 25 ? "low" : impactScore < 60 ? "medium" : "high";

  const localFallback: ContrailImpactResult = {
    impactScore,
    riskRating,
    reasoning: `Formation ${Math.round(prob * 100)}% × RF ${rfMw.toFixed(1)} mW/m² × ${persistenceHours.toFixed(1)}h persistence. ${depHour >= 18 || depHour < 6 ? "Night flight amplifies warming (no solar offset)." : "Daytime flight partially offsets via solar reflection."} ${aircraftType} engine: ${sootFactor < 1 ? "low" : "high"} soot. ${persistentWaypoints}/${totalWaypoints} waypoints persistent.`,
  };

  return k2ChatJSON<ContrailImpactResult>(
    [
      {
        role: "system",
        content: `You are a contrail climate scientist with deep expertise in aviation-induced cloudiness and radiative forcing. Score the contrail warming impact of a specific flight on a 0-100 scale.

${CONTRAIL_SCIENCE}

${AIRCRAFT_REFERENCE}

SCORING METHODOLOGY:
You must reason through EACH of these factors and their interactions:

1. FORMATION PROBABILITY (base score driver, 0-40 range)
   - This tells you what fraction of the flight path meets the Schmidt-Appleman Criterion
   - >70% = very concerning, large swath of ice-supersaturated air
   - 30-70% = moderate exposure
   - <30% = limited contrail formation regions

2. RADIATIVE FORCING (amplifier, reference the benchmarks above)
   - This is the actual measured/predicted warming effect per unit area
   - Use the mW/m² benchmarks to calibrate severity

3. PERSISTENCE (exponential amplifier — this is critical)
   - Short contrails (<30min) are basically noise
   - Long contrails (4-6h) become contrail cirrus covering hundreds of km²
   - The relationship is EXPONENTIAL, not linear

4. TIME OF DAY (multiplier)
   - Night: 1.3-1.5x (no shortwave cooling, pure warming)
   - Dawn/dusk: 1.1-1.2x
   - Midday: 0.7-0.85x (solar reflection partially offsets)

5. AIRCRAFT ENGINE (modifier)
   - Check the Soot Index in the aircraft table
   - Low soot engines reduce contrail impact 30-50%

6. ROUTE COVERAGE (modifier)
   - persistent_waypoints / total_waypoints tells you how much of the route is affected
   - >50% = widespread ice supersaturation along route
   - <20% = isolated pockets

IMPORTANT: Think about how these factors INTERACT. A night flight with high persistence and high RF is FAR worse than the sum of its parts. A daytime flight with low persistence through new-gen engines might score very low even with moderate formation probability.

Thresholds: <25 = low, 25-60 = medium, >60 = high

Return ONLY valid JSON after your reasoning:
{"impactScore": 0-100, "riskRating": "low"|"medium"|"high", "reasoning": "2-3 sentences explaining the key factors and their interactions that drove the score"}`,
      },
      {
        role: "user",
        content: `Score the contrail climate impact for this flight:

- Formation probability: ${(prob * 100).toFixed(1)}% of waypoints meet SAC
- Mean radiative forcing: ${(rf * 1000).toFixed(3)} mW/m² (${rfMw < 0.5 ? "negligible" : rfMw < 2.0 ? "moderate" : rfMw < 5.0 ? "significant" : "severe"} per reference benchmarks)
- Max contrail persistence: ${persistenceHours.toFixed(1)} hours (${persistenceHours < 0.5 ? "negligible" : persistenceHours < 2 ? "short-lived" : persistenceHours < 4 ? "moderate duration, spreading into cirrus" : "long-lived contrail cirrus"})
- Departure time: ${depHour}:00 UTC (${depHour >= 18 || depHour < 6 ? "NIGHT — no shortwave offset, pure warming" : depHour >= 6 && depHour < 8 ? "dawn — minimal solar offset" : depHour >= 16 && depHour < 18 ? "dusk — minimal solar offset" : "daytime — partial solar cooling offset"})
- Aircraft: ${aircraftType} (check soot index in reference table)
- Persistent contrail waypoints: ${persistentWaypoints}/${totalWaypoints} (${(coverageRatio * 100).toFixed(0)}% of route)

Reason through each factor, consider their interactions, then score 0-100.`,
      },
    ],
    localFallback,
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   AIRLINE SCORING
   ═══════════════════════════════════════════════════════════════════════════ */

export interface AirlineScoreResult {
  contrailAvoidance: number;
  fuelEfficiency: number;
  safAdoption: number;
  routeOptimization: number;
  emissionsTrajectory: number;
  overallScore: number;
  tier: string;
  reasoning: string;
}

export async function k2ScoreAirline(params: {
  airlineName: string;
  airlineCode: string;
  fleetSize: number;
  fleetAge: number;
  avgFuelEfficiency: number;
  safPercent: number;
  contrailProgramActive: boolean;
  routeOptScore: number;
  fleetTypes: { type: string; count: number; fuelEfficiency: number }[];
}): Promise<AirlineScoreResult> {
  const {
    airlineName,
    airlineCode,
    fleetSize,
    fleetAge,
    avgFuelEfficiency,
    safPercent,
    contrailProgramActive,
    routeOptScore,
    fleetTypes,
  } = params;

  // ── Local fallback with rubric-calibrated scoring ──
  // Contrail avoidance
  const contrailAvoidance = contrailProgramActive ? 70 : 22;

  // Fuel efficiency (rubric-calibrated)
  let fuelEfficiency: number;
  if (avgFuelEfficiency <= 2.3) fuelEfficiency = 95;
  else if (avgFuelEfficiency <= 2.6) fuelEfficiency = 70 + ((2.6 - avgFuelEfficiency) / 0.3) * 20;
  else if (avgFuelEfficiency <= 3.0) fuelEfficiency = 50 + ((3.0 - avgFuelEfficiency) / 0.4) * 20;
  else if (avgFuelEfficiency <= 3.3) fuelEfficiency = 30 + ((3.3 - avgFuelEfficiency) / 0.3) * 20;
  else fuelEfficiency = Math.max(0, 30 - ((avgFuelEfficiency - 3.3) / 0.5) * 30);
  // Fleet age modifier
  if (fleetAge < 10) fuelEfficiency += (10 - fleetAge) * 1.5;
  else if (fleetAge > 12) fuelEfficiency -= (fleetAge - 12) * 1;
  fuelEfficiency = Math.max(0, Math.min(100, Math.round(fuelEfficiency)));

  // SAF adoption (rubric-calibrated)
  let safAdoption: number;
  if (safPercent >= 5) safAdoption = 90 + Math.min(10, (safPercent - 5) * 2);
  else if (safPercent >= 2) safAdoption = 70 + ((safPercent - 2) / 3) * 20;
  else if (safPercent >= 0.5) safAdoption = 50 + ((safPercent - 0.5) / 1.5) * 20;
  else if (safPercent >= 0.1) safAdoption = 30 + ((safPercent - 0.1) / 0.4) * 20;
  else safAdoption = safPercent * 300; // 0-30 range for <0.1%
  safAdoption = Math.max(0, Math.min(100, Math.round(safAdoption)));

  // Route optimization: pass through
  const routeOpt = Math.round(routeOptScore);

  // Emissions trajectory
  let emissionsTrajectory: number;
  if (contrailProgramActive && fleetAge < 10) emissionsTrajectory = 80;
  else if (contrailProgramActive) emissionsTrajectory = 68;
  else if (fleetAge < 8) emissionsTrajectory = 65;
  else if (fleetAge < 12) emissionsTrajectory = 50;
  else emissionsTrajectory = 38;

  const overallScore = Math.round(
    contrailAvoidance * 0.30 +
    fuelEfficiency * 0.25 +
    safAdoption * 0.20 +
    routeOpt * 0.15 +
    emissionsTrajectory * 0.10,
  );

  const tier =
    overallScore >= 75 ? "Sky Saints"
    : overallScore >= 60 ? "Clean Cruisers"
    : overallScore >= 45 ? "Middle of the Pack"
    : overallScore >= 30 ? "Greenwash Gold Medalists"
    : "Contrail Criminals";

  const localFallback: AirlineScoreResult = {
    contrailAvoidance,
    fuelEfficiency,
    safAdoption,
    routeOptimization: routeOpt,
    emissionsTrajectory,
    overallScore,
    tier,
    reasoning: `${airlineName} scores ${overallScore}/100 (${tier}). ${contrailProgramActive ? "Active contrail program boosts ranking significantly." : "No contrail avoidance program — the largest scoring penalty."} Fleet efficiency ${avgFuelEfficiency.toFixed(1)} L/100pax-km (age ${fleetAge}y), SAF at ${safPercent}%.`,
  };

  // Build fleet composition string for K2
  const fleetComposition = fleetTypes
    .sort((a, b) => b.count - a.count)
    .map((t) => `  ${t.type}: ${t.count} aircraft (${t.fuelEfficiency} L/100pax-km)`)
    .join("\n");

  return k2ChatJSON<AirlineScoreResult>(
    [
      {
        role: "system",
        content: `You are an aviation environmental analyst for the SkyPrint climate platform. Score an airline's environmental performance using the detailed rubric below.

${AIRLINE_SCORING_RUBRIC}

${AIRCRAFT_REFERENCE}

INSTRUCTIONS:
1. Score EACH category independently using the rubric ranges (not just the data — apply judgment)
2. Consider cross-category signals: e.g., a very young fleet (low age) with new-gen aircraft suggests improving trajectory even without a formal program
3. Apply the EXACT weights: contrail(30%) + fuel(25%) + SAF(20%) + route(15%) + trajectory(10%)
4. Compute overallScore as the weighted sum, then assign the tier label
5. Write reasoning that explains the KEY differentiators — what pushes this airline up or down

Think through each category step by step in <think> tags.

Return ONLY valid JSON after your reasoning:
{"contrailAvoidance": 0-100, "fuelEfficiency": 0-100, "safAdoption": 0-100, "routeOptimization": 0-100, "emissionsTrajectory": 0-100, "overallScore": 0-100, "tier": "tier label", "reasoning": "2-3 sentences on key differentiators"}`,
      },
      {
        role: "user",
        content: `Score ${airlineName} (${airlineCode}):

FLEET PROFILE:
- Total fleet: ${fleetSize} aircraft
- Average fleet age: ${fleetAge} years
- Fleet-weighted fuel efficiency: ${avgFuelEfficiency.toFixed(2)} L/100pax-km
- Fleet composition:
${fleetComposition}

SUSTAINABILITY:
- SAF adoption: ${safPercent}% of total fuel (industry average ~0.5%)
- Contrail avoidance program: ${contrailProgramActive ? "YES — active formal program with research partners" : "NO — no contrail-aware operations"}

OPERATIONS:
- Route optimization score: ${routeOptScore}/100 (from operational data)

Score each category using the rubric, apply the weights, assign the tier.`,
      },
    ],
    localFallback,
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FLIGHT COMPARISON ANALYSIS
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ComparisonAnalysis {
  betterChoice: string;
  carbonCostPerKg: number;
  carbonMarketPrice: number;
  totalClimateImpactA: number; // 0-100 combined CO₂ + contrail
  totalClimateImpactB: number;
  summary: string;
}

export async function k2AnalyzeComparison(flightA: {
  airline: string;
  airlineCode: string;
  aircraftType: string;
  price?: number;
  co2Kg: number;
  contrailImpactScore: number;
  duration: number;
}, flightB: {
  airline: string;
  airlineCode: string;
  aircraftType: string;
  price?: number;
  co2Kg: number;
  contrailImpactScore: number;
  duration: number;
}): Promise<ComparisonAnalysis> {
  const co2Delta = Math.abs(flightA.co2Kg - flightB.co2Kg);
  const priceDelta = Math.abs((flightA.price ?? 0) - (flightB.price ?? 0));

  // Total climate impact: CO₂ (40%) + contrail (60%) — contrails are the bigger lever
  const impactA = Math.round(flightA.co2Kg * 0.15 + flightA.contrailImpactScore * 0.6);
  const impactB = Math.round(flightB.co2Kg * 0.15 + flightB.contrailImpactScore * 0.6);

  const betterCode = impactA <= impactB ? flightA.airlineCode : flightB.airlineCode;
  const carbonMarketPrice = 55; // ~€50/tonne EU ETS 2024 avg ≈ $55
  const costPerKg = co2Delta > 0 && flightA.price && flightB.price
    ? priceDelta / co2Delta
    : 0;

  const localFallback: ComparisonAnalysis = {
    betterChoice: betterCode,
    carbonCostPerKg: Math.round(costPerKg * 100) / 100,
    carbonMarketPrice,
    totalClimateImpactA: Math.min(100, impactA),
    totalClimateImpactB: Math.min(100, impactB),
    summary: co2Delta > 5
      ? `${betterCode === flightA.airlineCode ? flightA.airline : flightB.airline} is the better climate choice, saving ~${Math.round(co2Delta)} kg CO₂ per passenger. ${flightA.price && flightB.price ? `The $${priceDelta.toFixed(0)} price difference translates to $${costPerKg.toFixed(2)}/kg CO₂ — ${costPerKg < 0.15 ? "well below" : costPerKg < 0.50 ? "comparable to" : "above"} the EU carbon market price of ~$0.055/kg.` : ""} Contrail impact is ${Math.abs(flightA.contrailImpactScore - flightB.contrailImpactScore) > 20 ? "significantly different" : "similar"} between the two flights.`
      : `Both flights produce similar CO₂ (within ${Math.round(co2Delta)} kg). The key differentiator is contrail impact: ${flightA.contrailImpactScore < flightB.contrailImpactScore ? flightA.airline : flightB.airline} scores lower on contrail warming.`,
  };

  return k2ChatJSON<ComparisonAnalysis>(
    [
      {
        role: "system",
        content: `You are a climate economist specializing in aviation environmental impact. Compare two flights and determine which is the better climate choice.

${CONTRAIL_SCIENCE}

${CO2_SCIENCE}

COMPARISON FRAMEWORK:
1. TOTAL CLIMATE IMPACT = CO₂ impact (40%) + Contrail warming impact (60%)
   - SkyPrint's core thesis: contrails cause up to 57% of aviation's total warming, yet are rarely considered
   - A flight with lower CO₂ but much higher contrail impact may be WORSE overall

2. CARBON COST ANALYSIS:
   - Cost per kg CO₂ saved = |price difference| / |CO₂ difference|
   - EU ETS carbon price: ~$55/tonne = $0.055/kg (2024 average)
   - If cost/kg < $0.15: excellent deal (cheaper than most offset programs)
   - If cost/kg $0.15-0.50: reasonable premium
   - If cost/kg > $0.50: expensive, but may still be worth it for high-contrail flights

3. KEY DIFFERENTIATORS to highlight:
   - Aircraft engine generation (soot → contrail impact)
   - Time of day (night flights are contrail-worse)
   - CO₂ per passenger difference
   - Price premium for the greener choice

Return ONLY valid JSON:
{"betterChoice": "airline_code", "carbonCostPerKg": number, "carbonMarketPrice": 55, "totalClimateImpactA": 0-100, "totalClimateImpactB": 0-100, "summary": "3-4 sentence analysis covering CO₂, contrails, and cost tradeoff"}`,
      },
      {
        role: "user",
        content: `Compare these two flights on the same route:

Flight A: ${flightA.airline} (${flightA.airlineCode})
  - Aircraft: ${flightA.aircraftType}
  - Price: ${flightA.price ? "$" + flightA.price : "unknown"}
  - CO₂ per passenger: ${Math.round(flightA.co2Kg)} kg
  - Contrail impact score: ${flightA.contrailImpactScore}/100 (${flightA.contrailImpactScore < 25 ? "low" : flightA.contrailImpactScore < 60 ? "medium" : "high"} risk)
  - Duration: ${flightA.duration} min

Flight B: ${flightB.airline} (${flightB.airlineCode})
  - Aircraft: ${flightB.aircraftType}
  - Price: ${flightB.price ? "$" + flightB.price : "unknown"}
  - CO₂ per passenger: ${Math.round(flightB.co2Kg)} kg
  - Contrail impact score: ${flightB.contrailImpactScore}/100 (${flightB.contrailImpactScore < 25 ? "low" : flightB.contrailImpactScore < 60 ? "medium" : "high"} risk)
  - Duration: ${flightB.duration} min

Which is the better climate choice? Factor in BOTH CO₂ and contrail impact (weighted 40/60). Calculate the carbon cost if prices are available.`,
      },
    ],
    localFallback,
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FULL FLIGHT CLIMATE ASSESSMENT — K2 reasons from real flight data
   ═══════════════════════════════════════════════════════════════════════════ */

export interface FlightClimateAssessment {
  co2Kg: number;
  contrailImpactScore: number; // 0-100
  contrailRiskRating: "low" | "medium" | "high";
  totalImpactScore: number; // 0-100 combined
  reasoning: string;
}

/**
 * Have K2 Think reason about a flight's full climate impact from first
 * principles — using real route, aircraft, airline, and timing data instead
 * of random demo numbers.
 */
export async function k2AssessFlightClimate(params: {
  airline: string;
  airlineCode: string;
  aircraftType: string;
  origin: string;
  destination: string;
  distanceKm: number;
  durationMinutes: number;
  departureTimeISO: string;
  stops: number;
}): Promise<FlightClimateAssessment> {
  const {
    airline,
    airlineCode,
    aircraftType,
    origin,
    destination,
    distanceKm,
    durationMinutes,
    departureTimeISO,
    stops,
  } = params;

  const depHour = departureTimeISO
    ? new Date(departureTimeISO).getUTCHours()
    : 12;
  const isShortHaul = distanceKm < 1500;
  const durationHours = durationMinutes / 60;

  // ── Local fallback: science-grounded estimate ──

  // CO2: look up aircraft efficiency, scale by distance
  const efficiencyMap: Record<string, number> = {
    A220: 2.3, A320: 2.5, A321: 2.4, B738: 3.2, B739: 3.1, B789: 2.5,
    B78X: 2.5, B77W: 3.5, A332: 3.3, A333: 3.3, A359: 2.4, A35K: 2.3,
    E190: 3.4, A388: 3.8, B744: 4.2,
  };
  const fuelEff = efficiencyMap[aircraftType] ?? 3.0;
  const taxiOverhead = isShortHaul ? 1.05 : 1.03;
  const climbOverhead = isShortHaul ? 1.12 : 1.08;
  const stopsOverhead = 1 + stops * 0.08;
  const baseFuelL = (fuelEff * distanceKm) / 100;
  const adjustedFuelL = baseFuelL * taxiOverhead * climbOverhead * 1.03 * stopsOverhead;
  const co2Kg = Math.round(adjustedFuelL * 2.54);

  // Contrail: engine soot + time of day + altitude/duration proxy
  const newGenTypes = ["B789", "A359", "A35K", "A321", "A320", "A220", "B78X"];
  const sootFactor = newGenTypes.includes(aircraftType) ? 0.6 : 1.0;
  const nightFactor = depHour >= 18 || depHour < 6 ? 1.4
    : (depHour >= 6 && depHour < 8) || (depHour >= 16 && depHour < 18) ? 1.15
    : 0.75;
  const durationFactor = Math.min(1.5, 0.5 + durationHours / 8);
  const altitudeFactor = isShortHaul ? 0.6 : 1.0;

  const contrailRaw = 35 * sootFactor * nightFactor * durationFactor * altitudeFactor;
  const contrailImpactScore = Math.min(100, Math.max(0, Math.round(contrailRaw)));
  const contrailRiskRating: "low" | "medium" | "high" =
    contrailImpactScore < 25 ? "low" : contrailImpactScore < 60 ? "medium" : "high";

  const co2Component = Math.min(50, (co2Kg / (isShortHaul ? 150 : distanceKm < 4000 ? 300 : 600)) * 40);
  const totalImpactScore = Math.min(100, Math.max(0, Math.round(co2Component + contrailImpactScore * 0.6)));

  const localFallback: FlightClimateAssessment = {
    co2Kg,
    contrailImpactScore,
    contrailRiskRating,
    totalImpactScore,
    reasoning: `${aircraftType} at ${fuelEff} L/100pax-km over ${distanceKm}km = ~${co2Kg}kg CO₂/pax. ${depHour >= 18 || depHour < 6 ? "Night departure amplifies contrail warming." : "Daytime departure partially offsets contrail warming via solar reflection."} ${newGenTypes.includes(aircraftType) ? "New-gen low-soot engines reduce contrail impact ~40%." : "Legacy engines produce higher soot, increasing contrail optical thickness."}${stops > 0 ? ` ${stops} stop(s) add ~${stops * 8}% fuel overhead.` : ""}`,
  };

  return k2ChatJSON<FlightClimateAssessment>(
    [
      {
        role: "system",
        content: `You are an aviation climate scientist. Assess the FULL climate impact of a specific flight — both CO₂ emissions and contrail warming — using the reference data below.

${CO2_SCIENCE}

${CONTRAIL_SCIENCE}

${AIRCRAFT_REFERENCE}

YOUR TASK:
1. ESTIMATE CO₂ per passenger:
   - Look up the aircraft type's fuel efficiency in the reference table
   - Apply ICAO correction factors (taxi, climb, routing, load factor at 82%)
   - Cross-check against the distance-based benchmarks
   - Factor in stops (each adds ~8% for extra climb/descent cycles)

2. SCORE CONTRAIL IMPACT (0-100):
   - Determine the aircraft's engine generation and soot index from the table
   - Factor in time of day (night = worst, daytime = partial offset)
   - Consider route length (longer flights = more time in ice-supersaturated regions)
   - Short-haul flights spend less time at contrail-forming altitudes (FL300+)
   - Apply the science: soot × time-of-day × duration × altitude exposure

3. ASSIGN RISK RATING: low (<25), medium (25-60), high (>60)

4. COMPUTE TOTAL IMPACT (0-100): 40% CO₂ (normalized to route benchmarks) + 60% contrail

5. WRITE REASONING: 2-3 sentences explaining the key factors

Think step by step in <think> tags. Then return ONLY valid JSON:
{"co2Kg": number, "contrailImpactScore": 0-100, "contrailRiskRating": "low"|"medium"|"high", "totalImpactScore": 0-100, "reasoning": "2-3 sentences"}`,
      },
      {
        role: "user",
        content: `Assess the full climate impact of this flight:

- Airline: ${airline} (${airlineCode})
- Aircraft: ${aircraftType} (look up in reference table for fuel efficiency and soot index)
- Route: ${origin} → ${destination} (great-circle distance: ${distanceKm} km, ${isShortHaul ? "short" : distanceKm < 4000 ? "medium" : "long"}-haul)
- Duration: ${durationHours.toFixed(1)} hours${stops > 0 ? ` (${stops} stop${stops > 1 ? "s" : ""})` : " (direct)"}
- Departure: ${departureTimeISO} (${depHour}:00 UTC — ${depHour >= 18 || depHour < 6 ? "NIGHT flight, no solar offset" : depHour >= 6 && depHour < 8 ? "dawn, minimal solar offset" : depHour >= 16 && depHour < 18 ? "dusk, minimal solar offset" : "daytime, partial solar cooling"})

Estimate CO₂/pax, score contrail impact 0-100, assign risk rating, compute total impact score.`,
      },
    ],
    localFallback,
  );
}
