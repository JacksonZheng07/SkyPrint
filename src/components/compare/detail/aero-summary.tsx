"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { FlightComparisonItem } from "@/lib/types/comparison";

interface AeroSummaryProps {
  better: FlightComparisonItem;
  worse: FlightComparisonItem;
}

export function AeroSummary({ better, worse }: AeroSummaryProps) {
  const co2Delta = Math.abs(Math.round(better.contrail.co2Kg - worse.contrail.co2Kg));
  return (
    <Card className="border-sky-200 bg-sky-50/50 dark:border-sky-900 dark:bg-sky-950/30">
      <CardContent className="flex gap-4 pt-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-violet-500">
          <span className="text-sm font-bold text-white">A</span>
        </div>
        <div>
          <p className="text-sm font-semibold">Here&apos;s the difference in simple terms.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {better.flight.airline} has much lower contrail risk because it flies at altitudes
            with less moisture and ice — reducing warming impact. You&apos;ll also emit {co2Delta}kg
            less CO₂.
          </p>
          <button className="mt-2 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
            Explain more
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
