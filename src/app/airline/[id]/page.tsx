"use client";

import { useEffect, useState, use } from "react";
import { Scorecard } from "@/components/airline/scorecard";
import { FleetChart } from "@/components/airline/fleet-chart";
import { TrendGraph } from "@/components/airline/trend-graph";
import type { AirlineScore } from "@/lib/types/airline";

export default function AirlinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [score, setScore] = useState<AirlineScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchScore() {
      try {
        const res = await fetch("/api/score-airline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ airlineCode: id }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load");
        }
        setScore(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load airline data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchScore();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">
            Scoring {id.toUpperCase()}...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!score) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <Scorecard score={score} />
      <div className="grid gap-6 lg:grid-cols-2">
        <FleetChart fleet={score.fleetProfile} />
        <TrendGraph airlineName={score.airlineName} />
      </div>
    </div>
  );
}
