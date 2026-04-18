"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import type { AirlineScore } from "@/lib/types/airline";

const gradeConfig: Record<string, { bg: string; border: string }> = {
  A: { bg: "from-green-500 to-emerald-600", border: "border-green-500/30" },
  B: { bg: "from-green-400 to-teal-500", border: "border-green-400/30" },
  C: { bg: "from-amber-400 to-yellow-500", border: "border-amber-400/30" },
  D: { bg: "from-orange-500 to-red-400", border: "border-orange-500/30" },
  F: { bg: "from-red-500 to-red-700", border: "border-red-500/30" },
};

const rankEmoji = ["🥇", "🥈", "🥉"];

export default function AirlinesPage() {
  const [scores, setScores] = useState<AirlineScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rankings")
      .then((r) => r.json())
      .then(setScores)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading airline rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold tracking-tight">
          ✈️ Airline Climate Rankings
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Who&apos;s leading the charge for cleaner skies?
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Rankings based on fleet efficiency, route optimization, contrail mitigation, and sustainable fuel adoption.
        </p>
      </motion.div>

      {/* Podium for top 3 */}
      {scores.length >= 3 && (
        <div className="grid gap-4 md:grid-cols-3">
          {[scores[1], scores[0], scores[2]].map((airline, visualIdx) => {
            const actualRank = visualIdx === 1 ? 0 : visualIdx === 0 ? 1 : 2;
            const config = gradeConfig[airline.overallGrade];
            const isFirst = actualRank === 0;

            return (
              <motion.div
                key={airline.airlineCode}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + actualRank * 0.15 }}
                className={isFirst ? "md:-mt-4" : "md:mt-4"}
              >
                <Link href={`/airline/${airline.airlineCode.toLowerCase()}`}>
                  <Card
                    className={`group cursor-pointer overflow-hidden transition-all hover:shadow-xl ${config.border} border-2`}
                  >
                    <div className={`bg-gradient-to-r ${config.bg} h-1.5`} />
                    <CardContent className="pt-5 text-center">
                      <span className="text-4xl">{rankEmoji[actualRank]}</span>
                      <div className="mt-2">
                        <div
                          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${config.bg} text-2xl font-bold text-white shadow-lg`}
                        >
                          {airline.overallGrade}
                        </div>
                      </div>
                      <h3 className="mt-3 text-lg font-bold group-hover:text-primary transition-colors">
                        {airline.airlineName}
                      </h3>
                      <Badge variant="secondary" className="mt-1">
                        {airline.airlineCode}
                      </Badge>
                      <div className="mt-3 text-3xl font-bold">
                        {airline.overallScore}
                        <span className="text-sm font-normal text-muted-foreground">/100</span>
                      </div>

                      {/* Mini category bars */}
                      <div className="mt-4 space-y-1.5 text-left">
                        {(["contrailMitigation", "fleetEfficiency", "routeOptimization", "sustainableFuel"] as const).map(
                          (key) => (
                            <div key={key} className="flex items-center gap-2">
                              <span className="w-2 text-[10px]">
                                {key === "contrailMitigation" ? "☁️" : key === "fleetEfficiency" ? "✈️" : key === "routeOptimization" ? "🗺️" : "🌱"}
                              </span>
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                <div
                                  className={`h-full rounded-full ${
                                    airline.categories[key] >= 60
                                      ? "bg-green-500"
                                      : airline.categories[key] >= 40
                                        ? "bg-amber-400"
                                        : "bg-red-500"
                                  }`}
                                  style={{ width: `${airline.categories[key]}%` }}
                                />
                              </div>
                              <span className="w-6 text-right text-[10px] text-muted-foreground">
                                {airline.categories[key]}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full ranking list */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Full Rankings</h2>
        {scores.map((airline, i) => {
          const config = gradeConfig[airline.overallGrade];
          return (
            <motion.div
              key={airline.airlineCode}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <Link href={`/airline/${airline.airlineCode.toLowerCase()}`}>
                <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:border-primary/30">
                  <CardContent className="flex items-center gap-4 py-4">
                    {/* Rank */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg font-bold">
                      {i < 3 ? rankEmoji[i] : `#${i + 1}`}
                    </div>

                    {/* Grade */}
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${config.bg} text-lg font-bold text-white`}
                    >
                      {airline.overallGrade}
                    </div>

                    {/* Airline info */}
                    <div className="flex-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {airline.airlineName}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Fleet: {airline.fleetProfile.totalAircraft}</span>
                        <span>•</span>
                        <span>Avg age: {airline.fleetProfile.averageAge}y</span>
                        <span>•</span>
                        <span>
                          Contrail program:{" "}
                          {airline.categories.contrailMitigation >= 50 ? (
                            <span className="text-green-500 font-medium">Active</span>
                          ) : (
                            <span className="text-red-400">None</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Score + mini bars */}
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex sm:gap-1">
                        {(["contrailMitigation", "fleetEfficiency", "routeOptimization", "sustainableFuel"] as const).map(
                          (key) => (
                            <div
                              key={key}
                              className="h-8 w-1.5 overflow-hidden rounded-full bg-muted"
                              title={`${key}: ${airline.categories[key]}`}
                            >
                              <div
                                className={`w-full rounded-full ${
                                  airline.categories[key] >= 60
                                    ? "bg-green-500"
                                    : airline.categories[key] >= 40
                                      ? "bg-amber-400"
                                      : "bg-red-500"
                                }`}
                                style={{
                                  height: `${airline.categories[key]}%`,
                                  marginTop: `${100 - airline.categories[key]}%`,
                                }}
                              />
                            </div>
                          )
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold">{airline.overallScore}</span>
                        <span className="text-xs text-muted-foreground">/100</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Fun facts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <h3 className="mb-2 text-lg font-semibold">💡 Did You Know?</h3>
            <p className="text-sm text-muted-foreground">
              If all airlines adopted contrail-aware flight planning, we could eliminate
              up to <span className="font-bold text-foreground">35%</span> of aviation&apos;s total warming effect
              with less than <span className="font-bold text-foreground">1%</span> increase in fuel costs.
              That&apos;s the equivalent of planting{" "}
              <span className="font-bold text-green-500">billions of trees</span> every year.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
