"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { FleetProfile } from "@/lib/types/airline";

interface FleetChartProps {
  fleet: FleetProfile;
}

const typeColors = [
  "bg-sky-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

export function FleetChart({ fleet }: FleetChartProps) {
  const maxCount = Math.max(...fleet.aircraftTypes.map((t) => t.count));

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="mb-4 text-lg font-semibold">Fleet Composition</h3>
        <div className="mb-4 flex gap-4 text-sm text-muted-foreground">
          <span>{fleet.totalAircraft} aircraft</span>
          <span>Avg age: {fleet.averageAge} years</span>
        </div>

        <div className="space-y-3">
          {fleet.aircraftTypes.map((type, i) => (
            <div key={type.type} className="flex items-center gap-3">
              <span className="w-12 text-sm font-medium">{type.type}</span>
              <div className="flex-1">
                <div className="h-6 w-full rounded bg-muted">
                  <div
                    className={`flex h-6 items-center rounded px-2 text-xs font-medium text-white ${typeColors[i % typeColors.length]}`}
                    style={{
                      width: `${(type.count / maxCount) * 100}%`,
                      minWidth: "2rem",
                    }}
                  >
                    {type.count}
                  </div>
                </div>
              </div>
              <span className="w-24 text-right text-xs text-muted-foreground">
                {type.fuelEfficiency} L/100km
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
