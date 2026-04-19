"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreCircle } from "@/components/compare/score-circle";
import { ContrailBlocks } from "@/components/compare/contrail-blocks";
import type { FlightComparison, FlightComparisonItem } from "@/lib/types/comparison";
import {
  formatCo2,
  formatDuration,
  formatContrailRisk,
  formatImpactScore,
} from "@/lib/utils/format";

export default function CompareDetailPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-muted-foreground">Loading...</div>}>
      <CompareDetailContent />
    </Suspense>
  );
}

function CompareDetailContent() {
  const searchParams = useSearchParams();
  const idA = searchParams.get("a");
  const idB = searchParams.get("b");

  const [flightA, setFlightA] = useState<FlightComparisonItem | null>(null);
  const [flightB, setFlightB] = useState<FlightComparisonItem | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("skyprint_comparison");
    if (!raw || !idA || !idB) return;
    const data: FlightComparison = JSON.parse(raw);
    setFlightA(data.flights.find((f) => f.flight.flightId === idA) ?? null);
    setFlightB(data.flights.find((f) => f.flight.flightId === idB) ?? null);
  }, [idA, idB]);

  if (!flightA || !flightB) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Loading comparison...</p>
        <Link href="/compare" className="mt-4 text-sm text-emerald-600 hover:underline">
          ← Back to search
        </Link>
      </div>
    );
  }

  const better = flightA.totalImpactScore <= flightB.totalImpactScore ? "a" : "b";

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Back link */}
      <Link
        href="/compare"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to results
      </Link>

      <h1 className="text-2xl font-bold">Compare Flights</h1>

      {/* Flight headers */}
      <div className="grid grid-cols-2 gap-6">
        <FlightHeader item={flightA} label="Selected" />
        <FlightHeader item={flightB} label="" />
      </div>

      {/* Total Impact Score */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-6 text-center text-lg font-semibold">Total Impact Score</h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col items-center gap-3">
              <ScoreCircle score={flightA.totalImpactScore} size="lg" />
              {better === "a" && (
                <Badge className="bg-emerald-600 text-white">Better Choice</Badge>
              )}
            </div>
            <div className="flex flex-col items-center gap-3">
              <ScoreCircle score={flightB.totalImpactScore} size="lg" />
              {better === "b" && (
                <Badge className="bg-emerald-600 text-white">Better Choice</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contrail Impact */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold">Contrail Impact (Primary)</h2>
          <div className="grid grid-cols-2 gap-8">
            <ContrailSection item={flightA} />
            <ContrailSection item={flightB} />
          </div>
        </CardContent>
      </Card>

      {/* CO2 Emissions */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold">CO₂ Emissions</h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold">{Math.round(flightA.contrail.co2Kg)} kg</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{Math.round(flightB.contrail.co2Kg)} kg</p>
            </div>
          </div>
          {/* Visual bar comparison */}
          <div className="mt-4 grid grid-cols-2 gap-8">
            <Co2Bar
              value={flightA.contrail.co2Kg}
              max={Math.max(flightA.contrail.co2Kg, flightB.contrail.co2Kg)}
              isBetter={flightA.contrail.co2Kg <= flightB.contrail.co2Kg}
            />
            <Co2Bar
              value={flightB.contrail.co2Kg}
              max={Math.max(flightA.contrail.co2Kg, flightB.contrail.co2Kg)}
              isBetter={flightB.contrail.co2Kg <= flightA.contrail.co2Kg}
            />
          </div>
        </CardContent>
      </Card>

      {/* Other Factors */}
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
              valueA={`${(flightA.contrail.co2Kg * 0.32).toFixed(1)} L`}
              valueB={`${(flightB.contrail.co2Kg * 0.32).toFixed(1)} L`}
            />
            <FactorRow
              label="Route Efficiency"
              valueA={flightA.flight.stops === 0 ? "Direct" : `${flightA.flight.stops} stop`}
              valueB={flightB.flight.stops === 0 ? "Direct" : `${flightB.flight.stops} stop`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-6">
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
      </div>

      {/* Aero explanation card */}
      <Card className="border-sky-200 bg-sky-50/50 dark:border-sky-900 dark:bg-sky-950/30">
        <CardContent className="flex gap-4 pt-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-violet-500">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <div>
            <p className="text-sm font-semibold">Here&apos;s the difference in simple terms.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {better === "a" ? flightA.flight.airline : flightB.flight.airline} has much lower
              contrail risk because it flies at altitudes with less moisture and ice — reducing
              warming impact. You&apos;ll also emit{" "}
              {Math.abs(Math.round(flightA.contrail.co2Kg - flightB.contrail.co2Kg))}kg less CO₂.
            </p>
            <button className="mt-2 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
              Explain more
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FlightHeader({ item, label }: { item: FlightComparisonItem; label: string }) {
  const { flight } = item;
  return (
    <Card>
      <CardContent className="pt-4">
        {label && (
          <Badge variant="secondary" className="mb-2 text-xs">
            {label}
          </Badge>
        )}
        <h3 className="font-semibold">
          {flight.airline || `${flight.airlineCode} ${flight.flightNumber}`}
        </h3>
        <p className="text-sm text-muted-foreground">
          {flight.airlineCode} {flight.flightNumber}
        </p>
        <p className="mt-1 text-sm">
          {flight.origin} &middot;{" "}
          {new Date(flight.departureTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          → {flight.destination} &middot;{" "}
          {new Date(flight.arrivalTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </CardContent>
    </Card>
  );
}

function ContrailSection({ item }: { item: FlightComparisonItem }) {
  const risk = formatContrailRisk(item.metrics.riskRating);
  return (
    <div className="flex flex-col items-center gap-3">
      <ContrailBlocks score={item.metrics.impactScore} size="md" />
      <Badge
        className={
          item.metrics.riskRating === "low"
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
            : item.metrics.riskRating === "medium"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
              : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
        }
      >
        {risk.label}
      </Badge>
      <p className="text-xs text-muted-foreground">
        {Math.round(item.contrail.summary.contrailProbability * 100)}% formation probability
      </p>
    </div>
  );
}

function Co2Bar({
  value,
  max,
  isBetter,
}: {
  value: number;
  max: number;
  isBetter: boolean;
}) {
  const pct = (value / max) * 100;
  return (
    <div className="h-3 rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${
          isBetter ? "bg-emerald-500" : "bg-zinc-400"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function FactorRow({
  label,
  valueA,
  valueB,
}: {
  label: string;
  valueA: string;
  valueB: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
      <p className="text-right text-sm font-medium">{valueA}</p>
      <p className="text-xs text-muted-foreground text-center min-w-[100px]">{label}</p>
      <p className="text-sm font-medium">{valueB}</p>
    </div>
  );
}
