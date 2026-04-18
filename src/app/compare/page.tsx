"use client";

import { useCallback } from "react";
import { FlightSearch } from "@/components/compare/flight-search";
import { ComparisonGrid } from "@/components/compare/comparison-grid";
import { AeroTrigger } from "@/components/aero/aero-trigger";
import { useComparison } from "@/hooks/use-comparison";
import { useAero } from "@/hooks/use-aero";
import type { FlightComparisonItem } from "@/lib/types/comparison";
import { formatCo2 } from "@/lib/utils/format";

export default function ComparePage() {
  const { comparison, isLoading, error, compare } = useComparison();
  const { trigger } = useAero();

  const handleSelectFlight = useCallback(
    (item: FlightComparisonItem) => {
      // Trigger Aero to summarize the selected flight's impact
      trigger(
        "flight_selected",
        JSON.stringify({
          flight: `${item.flight.airlineCode} ${item.flight.flightNumber}`,
          co2: formatCo2(item.contrail.co2Kg),
          contrailRisk: item.metrics.riskRating,
          impactScore: item.totalImpactScore,
        })
      );
    },
    [trigger]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <AeroTrigger comparison={comparison} />

      <div>
        <h1 className="text-3xl font-bold">Compare Flights</h1>
        <p className="mt-2 text-muted-foreground">
          Search flights and compare their total climate impact — CO2 and
          contrail radiative forcing.
        </p>
      </div>

      <FlightSearch onSearch={compare} isLoading={isLoading} />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">
              Analyzing flight routes, weather data, and contrail
              formation...
            </p>
          </div>
        </div>
      )}

      {comparison && !isLoading && (
        <ComparisonGrid
          comparison={comparison}
          onSelectFlight={handleSelectFlight}
        />
      )}
    </div>
  );
}
