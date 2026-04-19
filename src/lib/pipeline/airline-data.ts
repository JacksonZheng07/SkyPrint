import type { FleetProfile } from "@/lib/types/airline";

export interface AirlineStaticData {
  name: string;
  region: "North America" | "Europe" | "Asia Pacific" | "Middle East" | "Latin America" | "Africa";
  fleet: FleetProfile;
  /** SAF adoption %. Source noted in safSource. */
  safPercent: number;
  safSource: "annual_report" | "iata_estimate" | "unknown";
  /**
   * Route/operational efficiency score 0-100.
   * Updated by the SerpApi batch scraper; falls back to industry estimate.
   */
  routeOptScore: number;
  routeOptSource: "serpapi_aggregate" | "industry_estimate";
  contrailProgramActive: boolean;
}

// ─── Fuel efficiency reference (L / 100 pax-km, lower = better) ───────────
// A220:  2.3  B737 MAX 8/9: 2.5  A320neo: 2.5  A321neo: 2.4
// B787-9: 2.5  A350-900: 2.4  A350-1000: 2.3  B777X: 2.6
// A320ceo: 3.0  B737-800: 3.2  B737-900: 3.1  A321ceo: 2.8
// B777-300ER: 3.5  A330-200: 3.3  A330-300: 3.3  A330neo: 2.9
// A380: 3.8  B747-400: 4.2  B767-300: 3.6
// E190: 3.4

export const AIRLINE_DATA: Record<string, AirlineStaticData> = {
  // ── NORTH AMERICA ─────────────────────────────────────────────────────────
  AA: {
    name: "American Airlines",
    region: "North America",
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
    safPercent: 0.2,
    safSource: "annual_report",
    routeOptScore: 55,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  UA: {
    name: "United Airlines",
    region: "North America",
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
    safPercent: 0.5,
    safSource: "annual_report",
    routeOptScore: 62,
    routeOptSource: "industry_estimate",
    contrailProgramActive: true, // formal program with Google / Breakthrough Energy
  },
  DL: {
    name: "Delta Air Lines",
    region: "North America",
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
    safPercent: 0.1,
    safSource: "annual_report",
    routeOptScore: 58,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  AS: {
    name: "Alaska Airlines",
    region: "North America",
    fleet: {
      totalAircraft: 320,
      averageAge: 10.8,
      aircraftTypes: [
        { type: "B738", count: 143, fuelEfficiency: 3.2 },
        { type: "B739", count: 12, fuelEfficiency: 3.1 },
        { type: "A320", count: 62, fuelEfficiency: 3.0 },
        { type: "A321", count: 68, fuelEfficiency: 2.8 },
      ],
    },
    safPercent: 0.3,
    safSource: "annual_report",
    routeOptScore: 63,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  B6: {
    name: "JetBlue Airways",
    region: "North America",
    fleet: {
      totalAircraft: 290,
      averageAge: 10.2,
      aircraftTypes: [
        { type: "A320", count: 130, fuelEfficiency: 3.0 },
        { type: "A321", count: 100, fuelEfficiency: 2.8 },
        { type: "E190", count: 60, fuelEfficiency: 3.4 },
      ],
    },
    safPercent: 0.1,
    safSource: "annual_report",
    routeOptScore: 60,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  WN: {
    name: "Southwest Airlines",
    region: "North America",
    fleet: {
      totalAircraft: 700,
      averageAge: 12.4,
      aircraftTypes: [
        { type: "B738", count: 530, fuelEfficiency: 3.2 },
        { type: "B739", count: 170, fuelEfficiency: 3.1 },
      ],
    },
    safPercent: 0.0,
    safSource: "annual_report",
    routeOptScore: 65, // high-utilisation point-to-point
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  AC: {
    name: "Air Canada",
    region: "North America",
    fleet: {
      totalAircraft: 200,
      averageAge: 9.4,
      aircraftTypes: [
        { type: "B789", count: 37, fuelEfficiency: 2.5 },
        { type: "B738", count: 41, fuelEfficiency: 3.2 },
        { type: "A320", count: 42, fuelEfficiency: 3.0 },
        { type: "A321", count: 30, fuelEfficiency: 2.8 },
      ],
    },
    safPercent: 0.3,
    safSource: "annual_report",
    routeOptScore: 61,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  // ── EUROPE ────────────────────────────────────────────────────────────────
  BA: {
    name: "British Airways",
    region: "Europe",
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
    safPercent: 0.5,
    safSource: "annual_report",
    routeOptScore: 50,
    routeOptSource: "industry_estimate",
    contrailProgramActive: true, // NATS / Fly Net Zero partnership
  },
  LH: {
    name: "Lufthansa",
    region: "Europe",
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
    safPercent: 0.8,
    safSource: "annual_report",
    routeOptScore: 65,
    routeOptSource: "industry_estimate",
    contrailProgramActive: true,
  },
  AF: {
    name: "Air France",
    region: "Europe",
    fleet: {
      totalAircraft: 220,
      averageAge: 13.2,
      aircraftTypes: [
        { type: "A320", count: 72, fuelEfficiency: 3.0 },
        { type: "A332", count: 15, fuelEfficiency: 3.3 },
        { type: "B77W", count: 44, fuelEfficiency: 3.5 },
        { type: "A359", count: 38, fuelEfficiency: 2.4 },
      ],
    },
    safPercent: 0.3,
    safSource: "annual_report",
    routeOptScore: 52,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  KL: {
    name: "KLM Royal Dutch Airlines",
    region: "Europe",
    fleet: {
      totalAircraft: 116,
      averageAge: 12.1,
      aircraftTypes: [
        { type: "B738", count: 49, fuelEfficiency: 3.2 },
        { type: "B789", count: 16, fuelEfficiency: 2.5 },
        { type: "B77W", count: 16, fuelEfficiency: 3.5 },
        { type: "A332", count: 5, fuelEfficiency: 3.3 },
      ],
    },
    safPercent: 0.3,
    safSource: "annual_report",
    routeOptScore: 55,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  IB: {
    name: "Iberia",
    region: "Europe",
    fleet: {
      totalAircraft: 130,
      averageAge: 11.8,
      aircraftTypes: [
        { type: "A320", count: 54, fuelEfficiency: 3.0 },
        { type: "A321", count: 22, fuelEfficiency: 2.8 },
        { type: "A332", count: 9, fuelEfficiency: 3.3 },
        { type: "A359", count: 16, fuelEfficiency: 2.4 },
      ],
    },
    safPercent: 0.4,
    safSource: "annual_report",
    routeOptScore: 53,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  VY: {
    name: "Vueling",
    region: "Europe",
    fleet: {
      totalAircraft: 130,
      averageAge: 8.5,
      aircraftTypes: [
        { type: "A320", count: 86, fuelEfficiency: 3.0 },
        { type: "A321", count: 44, fuelEfficiency: 2.8 },
      ],
    },
    safPercent: 0.1,
    safSource: "iata_estimate",
    routeOptScore: 67, // high-utilisation, point-to-point
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  VS: {
    name: "Virgin Atlantic",
    region: "Europe",
    fleet: {
      totalAircraft: 42,
      averageAge: 9.8,
      aircraftTypes: [
        { type: "A339", count: 12, fuelEfficiency: 2.9 },
        { type: "A359", count: 16, fuelEfficiency: 2.4 },
        { type: "B789", count: 14, fuelEfficiency: 2.5 },
      ],
    },
    safPercent: 0.5,
    safSource: "annual_report",
    routeOptScore: 58,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  FR: {
    name: "Ryanair",
    region: "Europe",
    fleet: {
      totalAircraft: 570,
      averageAge: 7.9,
      aircraftTypes: [
        { type: "B738", count: 360, fuelEfficiency: 3.2 },
        { type: "B739", count: 210, fuelEfficiency: 3.1 },
      ],
    },
    safPercent: 0.1,
    safSource: "annual_report",
    routeOptScore: 72, // very high-density seating, high utilisation
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  U2: {
    name: "easyJet",
    region: "Europe",
    fleet: {
      totalAircraft: 330,
      averageAge: 8.4,
      aircraftTypes: [
        { type: "A319", count: 109, fuelEfficiency: 3.1 },
        { type: "A320", count: 172, fuelEfficiency: 3.0 },
        { type: "A321", count: 49, fuelEfficiency: 2.8 },
      ],
    },
    safPercent: 0.1,
    safSource: "annual_report",
    routeOptScore: 70,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  W6: {
    name: "Wizz Air",
    region: "Europe",
    fleet: {
      totalAircraft: 210,
      averageAge: 5.2,
      aircraftTypes: [
        { type: "A320", count: 58, fuelEfficiency: 3.0 },
        { type: "A321", count: 152, fuelEfficiency: 2.8 },
      ],
    },
    safPercent: 0.1,
    safSource: "iata_estimate",
    routeOptScore: 74, // youngest major fleet in Europe, dense config
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  SK: {
    name: "Scandinavian Airlines",
    region: "Europe",
    fleet: {
      totalAircraft: 130,
      averageAge: 11.4,
      aircraftTypes: [
        { type: "A320", count: 55, fuelEfficiency: 3.0 },
        { type: "A321", count: 30, fuelEfficiency: 2.8 },
        { type: "A332", count: 8, fuelEfficiency: 3.3 },
        { type: "A359", count: 8, fuelEfficiency: 2.4 },
      ],
    },
    safPercent: 1.2,
    safSource: "annual_report",
    routeOptScore: 60,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  AY: {
    name: "Finnair",
    region: "Europe",
    fleet: {
      totalAircraft: 80,
      averageAge: 10.6,
      aircraftTypes: [
        { type: "A320", count: 24, fuelEfficiency: 3.0 },
        { type: "A321", count: 12, fuelEfficiency: 2.8 },
        { type: "A333", count: 6, fuelEfficiency: 3.3 },
        { type: "A359", count: 17, fuelEfficiency: 2.4 },
      ],
    },
    safPercent: 0.4,
    safSource: "annual_report",
    routeOptScore: 62,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  TP: {
    name: "TAP Air Portugal",
    region: "Europe",
    fleet: {
      totalAircraft: 100,
      averageAge: 8.2,
      aircraftTypes: [
        { type: "A320", count: 36, fuelEfficiency: 3.0 },
        { type: "A321", count: 28, fuelEfficiency: 2.8 },
        { type: "A332", count: 6, fuelEfficiency: 3.3 },
        { type: "A339", count: 21, fuelEfficiency: 2.9 },
      ],
    },
    safPercent: 0.2,
    safSource: "iata_estimate",
    routeOptScore: 59,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  LX: {
    name: "Swiss International Air Lines",
    region: "Europe",
    fleet: {
      totalAircraft: 96,
      averageAge: 10.8,
      aircraftTypes: [
        { type: "A220", count: 30, fuelEfficiency: 2.3 },
        { type: "A320", count: 20, fuelEfficiency: 3.0 },
        { type: "A321", count: 9, fuelEfficiency: 2.8 },
        { type: "A333", count: 16, fuelEfficiency: 3.3 },
        { type: "B77W", count: 12, fuelEfficiency: 3.5 },
      ],
    },
    safPercent: 0.6,
    safSource: "annual_report",
    routeOptScore: 63,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  TK: {
    name: "Turkish Airlines",
    region: "Europe",
    fleet: {
      totalAircraft: 390,
      averageAge: 8.6,
      aircraftTypes: [
        { type: "A320", count: 74, fuelEfficiency: 3.0 },
        { type: "A321", count: 102, fuelEfficiency: 2.8 },
        { type: "B77W", count: 33, fuelEfficiency: 3.5 },
        { type: "B789", count: 30, fuelEfficiency: 2.5 },
        { type: "A359", count: 33, fuelEfficiency: 2.4 },
      ],
    },
    safPercent: 0.1,
    safSource: "iata_estimate",
    routeOptScore: 61,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  // ── MIDDLE EAST ───────────────────────────────────────────────────────────
  EK: {
    name: "Emirates",
    region: "Middle East",
    fleet: {
      totalAircraft: 256,
      averageAge: 8.3,
      aircraftTypes: [
        { type: "B77W", count: 139, fuelEfficiency: 3.5 },
        { type: "A388", count: 116, fuelEfficiency: 3.8 },
        { type: "B78X", count: 3, fuelEfficiency: 2.6 },
      ],
    },
    safPercent: 0.1,
    safSource: "annual_report",
    routeOptScore: 56,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  QR: {
    name: "Qatar Airways",
    region: "Middle East",
    fleet: {
      totalAircraft: 220,
      averageAge: 7.1,
      aircraftTypes: [
        { type: "A320", count: 22, fuelEfficiency: 3.0 },
        { type: "A321", count: 14, fuelEfficiency: 2.8 },
        { type: "A332", count: 4, fuelEfficiency: 3.3 },
        { type: "A359", count: 76, fuelEfficiency: 2.4 },
        { type: "B77W", count: 61, fuelEfficiency: 3.5 },
        { type: "B789", count: 30, fuelEfficiency: 2.5 },
      ],
    },
    safPercent: 0.2,
    safSource: "annual_report",
    routeOptScore: 60,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  EY: {
    name: "Etihad Airways",
    region: "Middle East",
    fleet: {
      totalAircraft: 100,
      averageAge: 9.2,
      aircraftTypes: [
        { type: "A320", count: 14, fuelEfficiency: 3.0 },
        { type: "A321", count: 8, fuelEfficiency: 2.8 },
        { type: "A332", count: 10, fuelEfficiency: 3.3 },
        { type: "B77W", count: 39, fuelEfficiency: 3.5 },
        { type: "B789", count: 29, fuelEfficiency: 2.5 },
      ],
    },
    safPercent: 0.1,
    safSource: "iata_estimate",
    routeOptScore: 57,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  // ── ASIA PACIFIC ──────────────────────────────────────────────────────────
  SQ: {
    name: "Singapore Airlines",
    region: "Asia Pacific",
    fleet: {
      totalAircraft: 130,
      averageAge: 7.0,
      aircraftTypes: [
        { type: "A359", count: 67, fuelEfficiency: 2.4 },
        { type: "A35K", count: 7, fuelEfficiency: 2.3 },
        { type: "B77W", count: 21, fuelEfficiency: 3.5 },
        { type: "B789", count: 14, fuelEfficiency: 2.5 },
        { type: "A388", count: 12, fuelEfficiency: 3.8 },
      ],
    },
    safPercent: 1.0,
    safSource: "annual_report",
    routeOptScore: 66,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  CX: {
    name: "Cathay Pacific",
    region: "Asia Pacific",
    fleet: {
      totalAircraft: 200,
      averageAge: 12.1,
      aircraftTypes: [
        { type: "A320", count: 36, fuelEfficiency: 3.0 },
        { type: "A321", count: 21, fuelEfficiency: 2.8 },
        { type: "A333", count: 22, fuelEfficiency: 3.3 },
        { type: "A359", count: 48, fuelEfficiency: 2.4 },
        { type: "B77W", count: 53, fuelEfficiency: 3.5 },
        { type: "B789", count: 12, fuelEfficiency: 2.5 },
      ],
    },
    safPercent: 0.3,
    safSource: "annual_report",
    routeOptScore: 58,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  JL: {
    name: "Japan Airlines",
    region: "Asia Pacific",
    fleet: {
      totalAircraft: 170,
      averageAge: 11.3,
      aircraftTypes: [
        { type: "B738", count: 41, fuelEfficiency: 3.2 },
        { type: "B789", count: 52, fuelEfficiency: 2.5 },
        { type: "B78X", count: 13, fuelEfficiency: 2.6 },
        { type: "A350", count: 28, fuelEfficiency: 2.4 },
        { type: "E190", count: 15, fuelEfficiency: 3.4 },
      ],
    },
    safPercent: 0.5,
    safSource: "annual_report",
    routeOptScore: 64,
    routeOptSource: "industry_estimate",
    contrailProgramActive: true, // partnered with Breakthrough Energy
  },
  NH: {
    name: "ANA All Nippon Airways",
    region: "Asia Pacific",
    fleet: {
      totalAircraft: 215,
      averageAge: 12.0,
      aircraftTypes: [
        { type: "B738", count: 48, fuelEfficiency: 3.2 },
        { type: "B789", count: 67, fuelEfficiency: 2.5 },
        { type: "B78X", count: 20, fuelEfficiency: 2.6 },
        { type: "A320", count: 33, fuelEfficiency: 3.0 },
        { type: "B77W", count: 18, fuelEfficiency: 3.5 },
      ],
    },
    safPercent: 0.5,
    safSource: "annual_report",
    routeOptScore: 63,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  QF: {
    name: "Qantas",
    region: "Asia Pacific",
    fleet: {
      totalAircraft: 130,
      averageAge: 14.2,
      aircraftTypes: [
        { type: "B738", count: 54, fuelEfficiency: 3.2 },
        { type: "A333", count: 22, fuelEfficiency: 3.3 },
        { type: "B789", count: 11, fuelEfficiency: 2.5 },
        { type: "A388", count: 12, fuelEfficiency: 3.8 },
      ],
    },
    safPercent: 0.3,
    safSource: "annual_report",
    routeOptScore: 57,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  // ── LATIN AMERICA ─────────────────────────────────────────────────────────
  LA: {
    name: "LATAM Airlines",
    region: "Latin America",
    fleet: {
      totalAircraft: 320,
      averageAge: 10.4,
      aircraftTypes: [
        { type: "A320", count: 128, fuelEfficiency: 3.0 },
        { type: "A321", count: 84, fuelEfficiency: 2.8 },
        { type: "B789", count: 50, fuelEfficiency: 2.5 },
        { type: "B77W", count: 17, fuelEfficiency: 3.5 },
      ],
    },
    safPercent: 0.1,
    safSource: "iata_estimate",
    routeOptScore: 54,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
  // ── AFRICA ────────────────────────────────────────────────────────────────
  ET: {
    name: "Ethiopian Airlines",
    region: "Africa",
    fleet: {
      totalAircraft: 130,
      averageAge: 7.8,
      aircraftTypes: [
        { type: "B738", count: 28, fuelEfficiency: 3.2 },
        { type: "B789", count: 22, fuelEfficiency: 2.5 },
        { type: "B77W", count: 10, fuelEfficiency: 3.5 },
        { type: "A350", count: 22, fuelEfficiency: 2.4 },
      ],
    },
    safPercent: 0.0,
    safSource: "iata_estimate",
    routeOptScore: 52,
    routeOptSource: "industry_estimate",
    contrailProgramActive: false,
  },
};

export function getSupportedAirlines(): string[] {
  return Object.keys(AIRLINE_DATA);
}
