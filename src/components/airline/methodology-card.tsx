"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface WeightEntry {
  label: string;
  weightPct: number;
  description: string;
}

const METHODOLOGY: WeightEntry[] = [
  {
    label: "Fleet Efficiency",
    weightPct: 30,
    description: "Weighted average fuel efficiency of fleet aircraft types, adjusted for fleet age.",
  },
  {
    label: "Route Optimization",
    weightPct: 25,
    description:
      "Flight path planning efficiency, including altitude optimization and great-circle routing.",
  },
  {
    label: "Contrail Mitigation",
    weightPct: 30,
    description:
      "Active programs to avoid ice-supersaturated regions. The highest-impact category — contrails cause ~35% of aviation warming.",
  },
  {
    label: "Sustainable Fuel",
    weightPct: 15,
    description: "Percentage of Sustainable Aviation Fuel (SAF) adopted in operations.",
  },
];

export function MethodologyCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
            <span>🔍</span> How We Calculate This Score
          </h3>
          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            {METHODOLOGY.map((entry) => (
              <div key={entry.label} className="rounded-lg bg-muted/50 p-3">
                <span className="font-medium text-foreground">
                  {entry.label} ({entry.weightPct}%)
                </span>
                <p className="mt-1">{entry.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
