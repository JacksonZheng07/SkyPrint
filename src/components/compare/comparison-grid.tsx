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
      sessionStorage.setItem("skyprint_comparison", JSON.stringify(comparison));
      router.push(`/compare/detail?a=${selectedIds[0]}&b=${selectedIds[1]}`);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            We found {comparison.flights.length} options
          </h2>
          <p className="flex items-center gap-1 text-sm text-white/50">
            {comparison.origin} &rarr; {comparison.destination} &middot; Avg{" "}
            {comparison.averageCo2Kg}kg CO₂/pax
            <svg className="h-3.5 w-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx={12} cy={12} r={10} />
              <path strokeLinecap="round" d="M12 16v-4m0-4h.01" />
            </svg>
          </p>
        </div>

        {comparison.warmingSpreadPct > 10 && (
          <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 backdrop-blur-sm">
            <svg className="h-5 w-5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-white/80">
              The lowest-impact option today reduces estimated warming by{" "}
              <span className="font-bold text-emerald-400">
                {comparison.warmingSpreadPct}%
              </span>{" "}
              versus the most climate-damaging flight shown.
            </p>
          </div>
        )}
      </div>

      {comparison.flights.every((f) => f.contrail.usedFallback) && (
        <div className="rounded-lg border border-amber-900 bg-amber-950/40 px-4 py-3">
          <p className="text-sm text-amber-300">
            <span className="font-semibold">Contrail scores are estimated.</span>{" "}
            Live atmospheric modeling is unavailable — scores are based on modeled route data and may differ from actual conditions.
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
