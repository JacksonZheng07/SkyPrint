"use client";

import type { FlightComparison, FlightComparisonItem } from "@/lib/types/comparison";
import { ComparisonCard } from "./comparison-card";

interface ComparisonGridProps {
  comparison: FlightComparison;
  onSelectFlight?: (item: FlightComparisonItem) => void;
}

export function ComparisonGrid({ comparison, onSelectFlight }: ComparisonGridProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {comparison.origin} → {comparison.destination}
          </h2>
          <p className="text-sm text-muted-foreground">
            {comparison.flights.length} flights compared &middot; Avg{" "}
            {comparison.averageCo2Kg}kg CO2/pax
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {comparison.flights.map((item, index) => (
          <ComparisonCard
            key={item.flight.flightId}
            item={item}
            isBest={item.rank === 1}
            index={index}
            onSelect={onSelectFlight}
          />
        ))}
      </div>
    </div>
  );
}
