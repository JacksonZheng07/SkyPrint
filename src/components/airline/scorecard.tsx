"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AirlineScore } from "@/lib/types/airline";
import { motion } from "framer-motion";

interface ScorecardProps {
  score: AirlineScore;
}

const gradeConfig: Record<string, { bg: string; glow: string; text: string; label: string }> = {
  A: { bg: "from-green-500 to-emerald-600", glow: "shadow-green-500/30", text: "text-green-500", label: "Excellent" },
  B: { bg: "from-green-400 to-teal-500", glow: "shadow-green-400/30", text: "text-green-400", label: "Good" },
  C: { bg: "from-amber-400 to-yellow-500", glow: "shadow-amber-400/30", text: "text-amber-400", label: "Average" },
  D: { bg: "from-orange-500 to-red-400", glow: "shadow-orange-500/30", text: "text-orange-500", label: "Below Average" },
  F: { bg: "from-red-500 to-red-700", glow: "shadow-red-500/30", text: "text-red-500", label: "Poor" },
};

const categoryConfig: Record<string, { label: string; icon: string; description: string }> = {
  fleetEfficiency: {
    label: "Fleet Efficiency",
    icon: "✈️",
    description: "Aircraft fuel efficiency and fleet age",
  },
  routeOptimization: {
    label: "Route Optimization",
    icon: "🗺️",
    description: "Flight path and altitude planning",
  },
  contrailMitigation: {
    label: "Contrail Mitigation",
    icon: "☁️",
    description: "Active contrail avoidance programs",
  },
  sustainableFuel: {
    label: "Sustainable Fuel",
    icon: "🌱",
    description: "SAF adoption percentage",
  },
};

export function Scorecard({ score }: ScorecardProps) {
  const config = gradeConfig[score.overallGrade];

  return (
    <div className="space-y-6">
      {/* Hero Grade Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={`overflow-hidden shadow-xl ${config.glow}`}>
          <div className={`bg-gradient-to-r ${config.bg} p-1`} />
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              {/* Grade circle */}
              <div className="relative">
                <svg className="h-28 w-28" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-muted/20"
                  />
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke="url(#gradeGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${(score.overallScore / 100) * 264} 264`}
                    className="transition-all duration-1000"
                    style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
                  />
                  <defs>
                    <linearGradient id="gradeGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={score.overallScore >= 65 ? "#22c55e" : score.overallScore >= 50 ? "#f59e0b" : "#ef4444"} />
                      <stop offset="100%" stopColor={score.overallScore >= 65 ? "#10b981" : score.overallScore >= 50 ? "#eab308" : "#dc2626"} />
                    </linearGradient>
                  </defs>
                  <text x="50" y="45" textAnchor="middle" className={`text-3xl font-bold ${config.text}`} fill="currentColor">
                    {score.overallGrade}
                  </text>
                  <text x="50" y="62" textAnchor="middle" className="text-[10px] fill-muted-foreground">
                    {score.overallScore}/100
                  </text>
                </svg>
              </div>

              <div className="flex-1">
                <h2 className="text-3xl font-bold tracking-tight">{score.airlineName}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary">{score.airlineCode}</Badge>
                  <Badge className={`bg-gradient-to-r ${config.bg} text-white border-0`}>
                    {config.label}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Environmental performance rating based on fleet efficiency, route optimization,
                  contrail mitigation, and sustainable fuel adoption.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {(
          Object.entries(score.categories) as [keyof typeof score.categories, number][]
        ).map(([key, value], i) => {
          const cat = categoryConfig[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
            >
              <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-2xl">{cat.icon}</span>
                      <h4 className="mt-1 font-semibold">{cat.label}</h4>
                      <p className="text-xs text-muted-foreground">{cat.description}</p>
                    </div>
                    <span className={`text-2xl font-bold ${
                      value >= 60 ? "text-green-500" : value >= 40 ? "text-amber-400" : "text-red-500"
                    }`}>
                      {value}
                    </span>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className={`h-full rounded-full ${
                        value >= 60
                          ? "bg-gradient-to-r from-green-500 to-emerald-400"
                          : value >= 40
                            ? "bg-gradient-to-r from-amber-400 to-yellow-400"
                            : "bg-gradient-to-r from-red-500 to-orange-400"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Transparency: How We Calculate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
              <span>🔍</span> How We Calculate This Score
            </h3>
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 p-3">
                <span className="font-medium text-foreground">Fleet Efficiency (30%)</span>
                <p className="mt-1">Weighted average fuel efficiency of fleet aircraft types, adjusted for fleet age.</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <span className="font-medium text-foreground">Route Optimization (25%)</span>
                <p className="mt-1">Flight path planning efficiency, including altitude optimization and great-circle routing.</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <span className="font-medium text-foreground">Contrail Mitigation (30%)</span>
                <p className="mt-1">Active programs to avoid ice-supersaturated regions. The highest-impact category — contrails cause ~35% of aviation warming.</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <span className="font-medium text-foreground">Sustainable Fuel (15%)</span>
                <p className="mt-1">Percentage of Sustainable Aviation Fuel (SAF) adopted in operations.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Narrative Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <span>🧠</span> AI Analysis
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              {score.narrative}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
