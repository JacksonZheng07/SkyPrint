"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AirlineScore } from "@/lib/types/airline";

interface ScorecardProps {
  score: AirlineScore;
}

const gradeColors: Record<string, string> = {
  A: "bg-green-500",
  B: "bg-green-400",
  C: "bg-amber-400",
  D: "bg-orange-500",
  F: "bg-red-500",
};

const categoryLabels: Record<string, string> = {
  fleetEfficiency: "Fleet Efficiency",
  routeOptimization: "Route Optimization",
  contrailMitigation: "Contrail Mitigation",
  sustainableFuel: "Sustainable Fuel",
};

export function Scorecard({ score }: ScorecardProps) {
  return (
    <div className="space-y-6">
      {/* Grade header */}
      <Card>
        <CardContent className="flex items-center gap-6 pt-6">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-2xl text-4xl font-bold text-white ${gradeColors[score.overallGrade]}`}
          >
            {score.overallGrade}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{score.airlineName}</h2>
            <p className="text-muted-foreground">
              Overall Score: {score.overallScore}/100
            </p>
            <Badge variant="secondary" className="mt-1">
              {score.airlineCode}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Category breakdown */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Category Scores</h3>
          <div className="space-y-4">
            {(
              Object.entries(score.categories) as [
                keyof typeof score.categories,
                number,
              ][]
            ).map(([key, value]) => (
              <div key={key}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{categoryLabels[key]}</span>
                  <span className="font-medium">{value}/100</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      value >= 60
                        ? "bg-green-500"
                        : value >= 40
                          ? "bg-amber-400"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Narrative */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-2 text-lg font-semibold">Analysis</h3>
          <p className="leading-relaxed text-muted-foreground">
            {score.narrative}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
