"use client";

import { useState, useCallback } from "react";
import type { SimulationResult } from "@/lib/types/comparison";
import type { AircraftType } from "@/lib/types/flight";

interface SimulationParams {
  origin: string;
  destination: string;
  aircraftType: AircraftType;
  departureTime: string;
  cruiseAltitudeFt: number;
}

export function useSimulation() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulate = useCallback(async (params: SimulationParams) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/simulate-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Simulation failed");
      }

      const data: SimulationResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { result, isLoading, error, simulate };
}
