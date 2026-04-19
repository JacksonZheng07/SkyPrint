"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { FlightHeader } from "@/components/compare/detail/flight-header";
import { ContrailSection } from "@/components/compare/detail/contrail-section";
import { Co2Bar } from "@/components/compare/detail/co2-bar";
import { FactorRow } from "@/components/compare/detail/factor-row";
import { ScoreCardPair } from "@/components/compare/detail/score-card-pair";
import { AeroSummary } from "@/components/compare/detail/aero-summary";
import type { FlightComparisonItem } from "@/lib/types/comparison";
import { formatDuration } from "@/lib/utils/format";

const FUEL_KG_TO_LITERS = 0.32;

export default function CompareDetailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CompareDetailContent />
    </Suspense>
  );
}

function LoadingState() {
  return <div className="py-16 text-center text-muted-foreground">Loading...</div>;
}

function CompareDetailContent() {
  const searchParams = useSearchParams();
  const idA = searchParams.get("a");
  const idB = searchParams.get("b");
  const [flightA] = useState<FlightComparisonItem | null>(null);
  const [flightB] = useState<FlightComparisonItem | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("skyprint_comparison");
    if (!raw || !idA || !idB) return;
  }, [idA, idB]);

  if (!flightA || !flightB) return <MissingData />;

  const better = flightA.totalImpactScore <= flightB.totalImpactScore ? "a" : "b";
  const betterItem = better === "a" ? flightA : flightB;
  const worseItem = better === "a" ? flightB : flightA;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <BackLink />
      <h1 className="text-2xl font-bold">Compare Flights</h1>

      <div className="grid grid-cols-2 gap-6">
        <FlightHeader item={flightA} label="Selected" />
        <FlightHeader item={flightB} />
      </div>

      <ScoreCardPair
        scoreA={flightA.totalImpactScore}
        scoreB={flightB.totalImpactScore}
        better={better}
      />

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold">Contrail Impact (Primary)</h2>
          <div className="grid grid-cols-2 gap-8">
            <ContrailSection item={flightA} />
            <ContrailSection item={flightB} />
          </div>
        </CardContent>
      </Card>

      <Co2Comparison flightA={flightA} flightB={flightB} />

      <OtherFactors flightA={flightA} flightB={flightB} />

      <div className="grid grid-cols-2 gap-6">
        <FlightActions />
        <FlightActions />
      </div>

      <AeroSummary better={betterItem} worse={worseItem} />
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/compare"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      Back to results
    </Link>
  );
}

function MissingData() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 text-center">
      <p className="text-muted-foreground">Loading comparison...</p>
      <Link href="/compare" className="mt-4 text-sm text-emerald-600 hover:underline">
        ← Back to search
      </Link>
    </div>
  );
}

function Co2Comparison({
  flightA,
  flightB,
}: {
  flightA: FlightComparisonItem;
  flightB: FlightComparisonItem;
}) {
  const co2A = flightA.contrail.co2Kg;
  const co2B = flightB.contrail.co2Kg;
  const max = Math.max(co2A, co2B);
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="mb-4 text-lg font-semibold">CO₂ Emissions</h2>
        <div className="grid grid-cols-2 gap-8">
          <p className="text-3xl font-bold text-center">{Math.round(co2A)} kg</p>
          <p className="text-3xl font-bold text-center">{Math.round(co2B)} kg</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-8">
          <Co2Bar value={co2A} max={max} isBetter={co2A <= co2B} />
          <Co2Bar value={co2B} max={max} isBetter={co2B <= co2A} />
        </div>
      </CardContent>
    </Card>
  );
}

function OtherFactors({
  flightA,
  flightB,
}: {
  flightA: FlightComparisonItem;
  flightB: FlightComparisonItem;
}) {
  const stopLabel = (stops: number) => (stops === 0 ? "Direct" : `${stops} stop`);
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="mb-4 text-lg font-semibold">Other Factors</h2>
        <div className="space-y-3">
          <FactorRow
            label="Flight Time"
            valueA={formatDuration(flightA.flight.duration)}
            valueB={formatDuration(flightB.flight.duration)}
          />
          <FactorRow
            label="Fuel Burn"
            valueA={`${(flightA.contrail.co2Kg * FUEL_KG_TO_LITERS).toFixed(1)} L`}
            valueB={`${(flightB.contrail.co2Kg * FUEL_KG_TO_LITERS).toFixed(1)} L`}
          />
          <FactorRow
            label="Route Efficiency"
            valueA={stopLabel(flightA.flight.stops)}
            valueB={stopLabel(flightB.flight.stops)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function FlightActions() {
  return (
    <div className="flex gap-3">
      <Link
        href="/compare"
        className="flex-1 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
      >
        Select This Flight
      </Link>
      <button className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent">
        View Details
      </button>
    </div>
  );
}
