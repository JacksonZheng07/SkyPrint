"use client";

import { useState } from "react";
import type { FlightComparison } from "@/lib/types/comparison";
import type { FlightSearchParams } from "@/lib/types/flight";

export function useComparison() {
  const [comparison, setComparison] = useState<FlightComparison | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function compare(params: FlightSearchParams) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/compare-flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to compare flights");
      }

      const data: FlightComparison = await response.json();
      setComparison(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return { comparison, isLoading, error, compare };
}
