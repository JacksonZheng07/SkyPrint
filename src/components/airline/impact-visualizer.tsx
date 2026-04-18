"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { AirlineScore } from "@/lib/types/airline";

interface ImpactVisualizerProps {
  score: AirlineScore;
}

/**
 * Visual representation of how much an airline could save the world.
 * Shows tree equivalents, contrail avoidance potential, and comparison data.
 */
export function ImpactVisualizer({ score }: ImpactVisualizerProps) {
  // Estimate annual impact based on fleet size and efficiency
  const fleetSize = score.fleetProfile.totalAircraft;
  const avgFlightsPerDay = fleetSize * 2.5; // roughly 2.5 flights per aircraft per day
  const annualFlights = avgFlightsPerDay * 365;

  // If the airline adopted contrail mitigation, ~30% of flights could avoid contrails
  const mitigatableFlights = Math.round(annualFlights * 0.3);
  // Average contrail radiative forcing equivalent in kg CO2 per flight
  const avgContrailCo2Equiv = 180; // kg CO2-equivalent per contrail-forming flight
  const potentialCo2SavedKg = mitigatableFlights * avgContrailCo2Equiv;
  const potentialTreesPerYear = Math.round(potentialCo2SavedKg / 21); // 21 kg CO2 per tree per year
  const potentialCarMiles = Math.round(potentialCo2SavedKg / 0.404);

  const stats = [
    {
      value: (potentialCo2SavedKg / 1_000_000).toFixed(1),
      unit: "k tonnes",
      label: "CO2-equiv saveable/year",
      icon: "🌍",
      color: "text-blue-500",
    },
    {
      value: (potentialTreesPerYear / 1_000_000).toFixed(1),
      unit: "M trees",
      label: "worth of CO2 absorption",
      icon: "🌳",
      color: "text-green-500",
    },
    {
      value: mitigatableFlights.toLocaleString(),
      unit: "flights",
      label: "could avoid contrails",
      icon: "✈️",
      color: "text-sky-500",
    },
    {
      value: (potentialCarMiles / 1_000_000).toFixed(0),
      unit: "M miles",
      label: "of car driving equivalent",
      icon: "🚗",
      color: "text-amber-500",
    },
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold">
          <span>🌏</span> Environmental Impact Potential
        </h3>
        <p className="mb-5 text-sm text-muted-foreground">
          If {score.airlineName} fully adopted contrail-aware flight planning:
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-xl border bg-muted/30 p-4 text-center"
            >
              <span className="text-3xl">{stat.icon}</span>
              <div className="mt-2">
                <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                <span className="ml-1 text-sm text-muted-foreground">{stat.unit}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Contrail vs CO2 comparison bar */}
        <div className="mt-6 rounded-lg border bg-muted/20 p-4">
          <h4 className="mb-3 text-sm font-semibold">
            Why Contrails Matter More Than You Think
          </h4>
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span>CO2 Emissions</span>
                <span className="font-medium">~40% of aviation warming</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gray-400"
                  initial={{ width: 0 }}
                  animate={{ width: "40%" }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-semibold text-orange-500">
                  Contrails & Non-CO2 Effects
                </span>
                <span className="font-bold text-orange-500">~60% of aviation warming</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: "60%" }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Contrails cause approximately 35% of aviation&apos;s total warming effect.
            Small altitude adjustments (1,000–2,000 ft) can avoid most contrail-forming regions
            with less than 1% fuel penalty.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
