import type { FlightOption } from "@/lib/types/flight";
import type { ContrailPrediction } from "@/lib/types/contrail";

// Realistic demo flight data for common routes
const DEMO_ROUTES: Record<string, FlightOption[]> = {
  "JFK-LAX": [
    {
      flightId: "AA-100-demo",
      airline: "American Airlines",
      airlineCode: "AA",
      flightNumber: "AA 100",
      origin: "JFK",
      destination: "LAX",
      departureTime: "",
      arrivalTime: "",
      aircraftType: "B738",
      duration: 330,
      stops: 0,
      price: 287,
    },
    {
      flightId: "UA-200-demo",
      airline: "United Airlines",
      airlineCode: "UA",
      flightNumber: "UA 200",
      origin: "JFK",
      destination: "LAX",
      departureTime: "",
      arrivalTime: "",
      aircraftType: "B789",
      duration: 325,
      stops: 0,
      price: 312,
    },
    {
      flightId: "DL-300-demo",
      airline: "Delta Air Lines",
      airlineCode: "DL",
      flightNumber: "DL 300",
      origin: "JFK",
      destination: "LAX",
      departureTime: "",
      arrivalTime: "",
      aircraftType: "A321",
      duration: 340,
      stops: 0,
      price: 299,
    },
    {
      flightId: "B6-400-demo",
      airline: "JetBlue Airways",
      airlineCode: "B6",
      flightNumber: "B6 400",
      origin: "JFK",
      destination: "LAX",
      departureTime: "",
      arrivalTime: "",
      aircraftType: "A320",
      duration: 345,
      stops: 0,
      price: 219,
    },
    {
      flightId: "NK-510-demo",
      airline: "Spirit Airlines",
      airlineCode: "NK",
      flightNumber: "NK 510",
      origin: "JFK",
      destination: "LAX",
      departureTime: "",
      arrivalTime: "",
      aircraftType: "A320",
      duration: 365,
      stops: 1,
      price: 149,
    },
    {
      flightId: "WN-620-demo",
      airline: "Southwest Airlines",
      airlineCode: "WN",
      flightNumber: "WN 620",
      origin: "JFK",
      destination: "LAX",
      departureTime: "",
      arrivalTime: "",
      aircraftType: "B738",
      duration: 380,
      stops: 1,
      price: 178,
    },
    {
      flightId: "AS-730-demo",
      airline: "Alaska Airlines",
      airlineCode: "AS",
      flightNumber: "AS 730",
      origin: "JFK",
      destination: "LAX",
      departureTime: "",
      arrivalTime: "",
      aircraftType: "B789",
      duration: 335,
      stops: 0,
      price: 329,
    },
  ],
  "JFK-LHR": [
    {
      flightId: "BA-178-demo",
      airline: "British Airways",
      airlineCode: "BA",
      flightNumber: "BA 178",
      origin: "JFK",
      destination: "LHR",
      departureTime: "",
      arrivalTime: "",
      aircraftType: "B77W",
      duration: 420,
      stops: 0,
      price: 742,
    },
    {
      flightId: "AA-106-demo",
      airline: "American Airlines",
      airlineCode: "AA",
      flightNumber: "AA 106",
      origin: "JFK",
      destination: "LHR",
      departureTime: "",
      arrivalTime: "",
      aircraftType: "B789",
      duration: 415,
      stops: 0,
      price: 698,
    },
    {
      flightId: "VS-004-demo",
      airline: "Virgin Atlantic",
      airlineCode: "VS",
      flightNumber: "VS 004",
      origin: "JFK",
      destination: "LHR",
      departureTime: "",
      arrivalTime: "",
      aircraftType: "A359",
      duration: 425,
      stops: 0,
      price: 765,
    },
  ],
  "SFO-NRT": [
    {
      flightId: "UA-837-demo",
      airline: "United Airlines",
      airlineCode: "UA",
      flightNumber: "UA 837",
      origin: "SFO",
      destination: "NRT",
      departureTime: "",
      arrivalTime: "",
      aircraftType: "B789",
      duration: 660,
      stops: 0,
      price: 892,
    },
    {
      flightId: "AA-170-demo",
      airline: "All Nippon Airways",
      airlineCode: "NH",
      flightNumber: "NH 170",
      origin: "SFO",
      destination: "NRT",
      departureTime: "",
      arrivalTime: "",
      aircraftType: "B77W",
      duration: 650,
      stops: 0,
      price: 945,
    },
  ],
};

export function getDemoFlights(
  origin: string,
  destination: string,
  date: string
): FlightOption[] {
  const key = `${origin}-${destination}`;
  const reverseKey = `${destination}-${origin}`;
  const flights = DEMO_ROUTES[key] ?? DEMO_ROUTES[reverseKey];

  if (!flights) {
    // Generate generic demo flights for any route
    return generateGenericFlights(origin, destination, date);
  }

  // Inject realistic times based on provided date
  const baseHour = 6;
  return flights.map((f, i) => {
    const depDate = new Date(`${date}T${String(baseHour + i * 3).padStart(2, "0")}:00:00Z`);
    const arrDate = new Date(depDate.getTime() + f.duration * 60000);
    return {
      ...f,
      departureTime: depDate.toISOString(),
      arrivalTime: arrDate.toISOString(),
    };
  });
}

function generateGenericFlights(
  origin: string,
  destination: string,
  date: string
): FlightOption[] {
  const airlines = [
    { code: "AA", name: "American Airlines", type: "B738" as const },
    { code: "UA", name: "United Airlines", type: "B789" as const },
    { code: "DL", name: "Delta Air Lines", type: "A321" as const },
    { code: "WN", name: "Southwest Airlines", type: "B738" as const },
    { code: "B6", name: "JetBlue Airways", type: "A320" as const },
    { code: "NK", name: "Spirit Airlines", type: "A320" as const },
  ];

  return airlines.map((a, i) => {
    const hour = 6 + i * 2 + Math.floor(seededRandom(i * 37) * 3);
    const depDate = new Date(`${date}T${String(Math.min(hour, 22)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}:00Z`);
    const duration = 150 + Math.floor(seededRandom(i * 53) * 200);
    const arrDate = new Date(depDate.getTime() + duration * 60000);
    const stops = i >= 4 ? 1 : i >= 3 ? (seededRandom(i * 71) > 0.5 ? 1 : 0) : 0;
    return {
      flightId: `${a.code}-${100 + i * 50}-demo`,
      airline: a.name,
      airlineCode: a.code,
      flightNumber: `${a.code} ${100 + i * 50}`,
      origin,
      destination,
      departureTime: depDate.toISOString(),
      arrivalTime: arrDate.toISOString(),
      aircraftType: a.type,
      duration,
      stops,
      price: 120 + Math.floor(seededRandom(i * 91) * 300),
    };
  });
}

// Seeded random for deterministic demo data
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function getDemoContrailPrediction(
  flightId: string,
  aircraftType: string,
  numWaypoints: number = 20,
  durationMinutes: number = 0
): ContrailPrediction {
  // Generate deterministic but varied data based on flightId + aircraftType
  const seed =
    flightId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) +
    aircraftType.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

  // Wider spread: some flights are clean, some are dirty
  const rng = seededRandom(seed);
  const baseProb = rng < 0.2 ? 0.08 + rng * 0.3   // ~20% chance: low risk
                 : rng < 0.5 ? 0.45 + rng * 0.4   // ~30% chance: medium risk
                 :              0.75 + rng * 0.25;  // ~50% chance: high risk
  const baseRf = rng < 0.2 ? 0.0003 + seededRandom(seed + 1) * 0.0008
               : rng < 0.5 ? 0.0015 + seededRandom(seed + 1) * 0.002
               :              0.004 + seededRandom(seed + 1) * 0.006;

  // Newer aircraft types have lower impact
  const efficiencyFactor =
    aircraftType === "B789" || aircraftType === "A359" || aircraftType === "A35K"
      ? 0.7
      : aircraftType === "A321" || aircraftType === "A320"
        ? 0.85
        : 1.0;

  const contrailProb = baseProb * efficiencyFactor;
  const rfNet = baseRf * efficiencyFactor;

  // CO2: ICAO-like estimation based on aircraft type
  const co2Base: Record<string, number> = {
    B738: 180,
    B789: 210,
    B77W: 340,
    A320: 155,
    A321: 170,
    A359: 230,
    A332: 280,
    A35K: 225,
    E190: 120,
  };
  // Scale CO2 by flight duration — longer flights burn more fuel
  const durationHours = durationMinutes > 0 ? durationMinutes / 60 : (numWaypoints > 1 ? numWaypoints * 0.5 : 2);
  const co2Kg = (co2Base[aircraftType] ?? 200) * (durationHours / 3) * (0.85 + seededRandom(seed + 2) * 0.3);

  const waypointResults = Array.from({ length: numWaypoints }, (_, i) => {
    const f = i / (numWaypoints - 1);
    // Contrails only form at cruise altitude (middle 80% of flight)
    const atCruise = f > 0.1 && f < 0.9;
    const wpSeed = seed + i * 7;
    const sacMet = atCruise && seededRandom(wpSeed) < contrailProb;
    const persistent = sacMet && seededRandom(wpSeed + 1) < 0.6;

    return {
      sacSatisfied: sacMet,
      persistent,
      rfNetWM2: persistent ? rfNet * (0.5 + seededRandom(wpSeed + 2)) : 0,
      contrailAgeHours: persistent ? 1 + seededRandom(wpSeed + 3) * 5 : null,
      efJPerM: persistent ? 1e8 * seededRandom(wpSeed + 4) : null,
    };
  });

  const persistentCount = waypointResults.filter((w) => w.persistent).length;
  const sacCount = waypointResults.filter((w) => w.sacSatisfied).length;

  return {
    flightId,
    waypointResults,
    summary: {
      contrailProbability: sacCount / numWaypoints,
      totalEnergyForcingJ: persistentCount * 1e9 * seededRandom(seed + 5),
      meanRfNetWM2: rfNet,
      maxContrailLifetimeHours: persistentCount > 0 ? 2 + seededRandom(seed + 6) * 4 : 0,
    },
    co2Kg: Math.round(co2Kg),
    usedFallback: true,
  };
}

export function getDemoSimulationResult(numWaypoints: number = 20, isNight: boolean = false, routeKey: string = "baseline-demo") {
  // Night: no shortwave cancellation → ~38% more contrail warming
  const nightMultiplier = isNight ? 1.38 : 1.0;

  const baseline = getDemoContrailPrediction(routeKey, "B789", numWaypoints);

  const scaledBaseline: ContrailPrediction = {
    ...baseline,
    summary: {
      ...baseline.summary,
      contrailProbability: Math.min(0.98, baseline.summary.contrailProbability * nightMultiplier),
      totalEnergyForcingJ: baseline.summary.totalEnergyForcingJ * nightMultiplier,
      meanRfNetWM2: baseline.summary.meanRfNetWM2 * nightMultiplier,
      maxContrailLifetimeHours: baseline.summary.maxContrailLifetimeHours * (isNight ? 1.25 : 1.0),
    },
  };

  const efReductionFraction = isNight ? 0.82 : 0.78;

  const optimized: ContrailPrediction = {
    ...scaledBaseline,
    flightId: `${routeKey}-optimized`,
    waypointResults: scaledBaseline.waypointResults.map((wp, i) => ({
      ...wp,
      sacSatisfied: wp.sacSatisfied && seededRandom(i * 13 + 3) > 0.55,
      persistent: false,
      rfNetWM2: 0,
      contrailAgeHours: null,
      efJPerM: null,
    })),
    summary: {
      contrailProbability: scaledBaseline.summary.contrailProbability * (1 - efReductionFraction * 0.9),
      totalEnergyForcingJ: scaledBaseline.summary.totalEnergyForcingJ * (1 - efReductionFraction),
      meanRfNetWM2: scaledBaseline.summary.meanRfNetWM2 * (1 - efReductionFraction),
      maxContrailLifetimeHours: 0,
    },
    co2Kg: Math.round(scaledBaseline.co2Kg * 1.015),
  };

  const adjustments = scaledBaseline.waypointResults
    .map((wp, i) => ({ wp, i }))
    .filter(({ wp }) => wp.persistent)
    .map(({ i }) => ({
      waypointIndex: i,
      originalAltitudeFt: 35000,
      suggestedAltitudeFt: 35000 + (seededRandom(i * 17) > 0.5 ? -2000 : 2000),
      reason: seededRandom(i * 23) > 0.5 ? "Avoid ice-supersaturated layer" : "Exit persistent contrail zone",
    }));

  return {
    baseline: scaledBaseline,
    optimized,
    altitudeAdjustments: adjustments,
    efReductionPercent: Math.round(
      (1 - optimized.summary.totalEnergyForcingJ / (scaledBaseline.summary.totalEnergyForcingJ || 1)) * 100
    ),
    fuelPenaltyPercent: isNight ? 1.8 : 1.5,
  };
}
