"use client";

import { useCallback, useMemo, useState } from "react";
import { FlightSearch } from "@/components/compare/flight-search";
import { FlightFilters, type SortKey } from "@/components/compare/flight-filters";
import { ComparisonGrid } from "@/components/compare/comparison-grid";
import { BookingConfirmation } from "@/components/compare/booking-confirmation";
import { AeroTrigger } from "@/components/aero/aero-trigger";
import { useComparison } from "@/hooks/use-comparison";
import { useAero } from "@/hooks/use-aero";
import { usePhoton } from "@/hooks/use-photon";
import type { FlightComparisonItem, ImpactSummary } from "@/lib/types/comparison";
import { formatCo2 } from "@/lib/utils/format";
import { calculateImpactSummary } from "@/lib/pipeline/impact";

export default function ComparePage() {
  const { comparison, isLoading, error, compare } = useComparison();
  const { trigger } = useAero();
  const { scheduleBooking } = usePhoton();

  const [selectedFlight, setSelectedFlight] = useState<FlightComparisonItem | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [impactSummary, setImpactSummary] = useState<ImpactSummary | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("best");

  // Sort flights based on active filter
  const sortedComparison = useMemo(() => {
    if (!comparison) return null;
    const sorted = [...comparison.flights];
    switch (sortKey) {
      case "contrail":
        sorted.sort((a, b) => a.metrics.impactScore - b.metrics.impactScore);
        break;
      case "co2":
        sorted.sort((a, b) => a.contrail.co2Kg - b.contrail.co2Kg);
        break;
      case "shortest":
        sorted.sort((a, b) => a.flight.duration - b.flight.duration);
        break;
      default: // "best" — keep original rank order
        sorted.sort((a, b) => a.rank - b.rank);
        break;
    }
    return { ...comparison, flights: sorted };
  }, [comparison, sortKey]);

  const handleSelectFlight = useCallback(
    (item: FlightComparisonItem) => {
      setSelectedFlight(item);
      setIsBooked(false);
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

  const handleConfirmBooking = useCallback(
    async (phoneNumber: string) => {
      if (!selectedFlight || !comparison) return;
      setIsBooking(true);

      try {
        const worstFlight = comparison.flights[comparison.flights.length - 1];
        const summary = calculateImpactSummary(
          selectedFlight.contrail.co2Kg,
          worstFlight.contrail.co2Kg
        );
        setImpactSummary(summary);

        await scheduleBooking({
          userId: "demo-user",
          departureTime: selectedFlight.flight.departureTime,
          arrivalTime: selectedFlight.flight.arrivalTime,
          payload: {
            phoneNumber,
            impactSummary: summary,
            contrailData: selectedFlight.metrics,
          },
        });

        setIsBooked(true);

        trigger(
          "booking_complete",
          JSON.stringify({
            flight: `${selectedFlight.flight.airlineCode} ${selectedFlight.flight.flightNumber}`,
            co2Saved: formatCo2(summary.co2Saved),
            contrailRisk: selectedFlight.metrics.riskRating,
          })
        );
      } catch (err) {
        console.error("Booking error:", err);
      } finally {
        setIsBooking(false);
      }
    },
    [selectedFlight, comparison, scheduleBooking, trigger]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-8">
      <AeroTrigger comparison={comparison} />

      <div>
        <h1 className="text-3xl font-bold">Compare Flights</h1>
        <p className="mt-2 text-muted-foreground">
          Search flights and compare their total climate impact — CO₂ and
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
              Analyzing flight routes, weather data, and contrail formation...
            </p>
          </div>
        </div>
      )}

      {sortedComparison && !isLoading && (
        <>
          <FlightFilters value={sortKey} onChange={setSortKey} />
          <ComparisonGrid
            comparison={sortedComparison}
            onSelectFlight={handleSelectFlight}
          />
        </>
      )}

      {selectedFlight && (
        <BookingConfirmation
          item={selectedFlight}
          impactSummary={impactSummary}
          onConfirm={handleConfirmBooking}
          onCancel={() => {
            setSelectedFlight(null);
            setIsBooked(false);
            setImpactSummary(null);
          }}
          isBooking={isBooking}
          isBooked={isBooked}
        />
      )}
    </div>
  );
}
