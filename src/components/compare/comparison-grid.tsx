"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FlightComparison, FlightComparisonItem } from "@/lib/types/comparison";
import { ComparisonCard } from "./comparison-card";

interface ComparisonGridProps {
  comparison: FlightComparison;
  onSelectFlight?: (item: FlightComparisonItem) => void;
}

export function ComparisonGrid({ comparison, onSelectFlight }: ComparisonGridProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  function handleCompareSelected() {
    if (selectedIds.length === 2) {
      // Store comparison data in sessionStorage for the detail page
      sessionStorage.setItem("skyprint_comparison", JSON.stringify(comparison));
      router.push(`/compare/detail?a=${selectedIds[0]}&b=${selectedIds[1]}`);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            We found {comparison.flights.length} options
          </h2>
          <p className="text-sm text-muted-foreground">
            {comparison.origin} → {comparison.destination} &middot; Avg{" "}
            {comparison.averageCo2Kg}kg CO₂/pax
          </p>
        </div>
      </div>

      {comparison.warmingSpreadPct > 10 && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/40">
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
            The lowest-impact option today reduces estimated warming by{" "}
            <span className="font-bold">{comparison.warmingSpreadPct}%</span>{" "}
            versus the most climate-damaging flight shown.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {comparison.flights.map((item, index) => (
          <ComparisonCard
            key={item.flight.flightId}
            item={item}
            isBest={item.rank === 1}
            index={index}
            selected={selectedIds.includes(item.flight.flightId)}
            onSelect={onSelectFlight}
            onToggleSelect={handleToggleSelect}
          />
        ))}
      </div>

      {/* Footnote */}
      <p className="text-xs text-muted-foreground text-center pt-2">
        Contrail impact is the leading factor in our total impact score.
      </p>

      {/* Compare selected floating bar */}
      {selectedIds.length === 2 && (
        <div className="sticky bottom-4 flex justify-center">
          <button
            onClick={handleCompareSelected}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-emerald-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            Compare These Flights
          </button>
        </div>
      )}
    </div>
  );
}
