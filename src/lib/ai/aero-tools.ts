import { z } from "zod";
import { tool } from "ai";
import { co2ToCarMiles, co2ToTrees } from "@/lib/utils/units";

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

export const aeroTools = {
  navigate: navigateTool,
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
