"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { FlightPicker, type FlightSelection } from "@/components/shared/flight-picker";
import type { PlaygroundMapHandle } from "./components/PlaygroundMap";

const PlaygroundMap = dynamic(() => import("./components/PlaygroundMap"), { ssr: false });

const AIRLINE_NAMES: Record<string, string> = {
  AAL: "American Airlines", BAW: "British Airways", DAL: "Delta Air Lines",
  UAL: "United Airlines", VIR: "Virgin Atlantic", DLH: "Lufthansa",
  AFR: "Air France", KLM: "KLM Royal Dutch Airlines",
};

interface SimStats {
  callsign: string;
  airline: string;
  origin: string;
  destination: string;
  date: string;
  contrailProbability: number | null;
  co2Kg: number | null;
  loading: boolean;
  error: string | null;
}

export default function PlaygroundPage() {
  const mapRef = useRef<PlaygroundMapHandle>(null);
  const [selected, setSelected] = useState<SimStats | null>(null);

  async function handleFlightSelect(flight: FlightSelection) {
    setSelected({
      callsign: flight.callsign,
      airline: flight.airline,
      origin: flight.origin,
      destination: flight.destination,
      date: flight.date,
      contrailProbability: null,
      co2Kg: null,
      loading: true,
      error: null,
    });

    mapRef.current?.showRoute(flight.origin, flight.destination, flight.date);

    try {
      const res = await fetch("/api/simulate-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: flight.origin,
          destination: flight.destination,
          aircraftType: "B77W",
          departureTime: new Date(`${flight.date}T10:00:00Z`).toISOString(),
          cruiseAltitudeFt: 35000,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelected((prev) =>
          prev
            ? {
                ...prev,
                loading: false,
                contrailProbability: data.baseline?.summary?.contrailProbability ?? null,
                co2Kg: data.baseline?.co2Kg ?? null,
              }
            : null
        );
      } else {
        setSelected((prev) => prev ? { ...prev, loading: false, error: "Simulation unavailable" } : null);
      }
    } catch {
      setSelected((prev) => prev ? { ...prev, loading: false, error: "Simulation unavailable" } : null);
    }
  }

  return (
    <div className="fixed inset-0 flex pt-14">
      {/* Left panel */}
      <div className="flex w-80 shrink-0 flex-col border-r bg-background overflow-hidden">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Flight Playground</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Pick a flight to model its contrail impact
          </p>
        </div>

        {/* Selected flight stats */}
        {selected && (
          <div className="border-b bg-muted/30 px-4 py-3 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">{selected.callsign}</p>
                <p className="text-xs text-muted-foreground">
                  {AIRLINE_NAMES[selected.airline] ?? selected.airline}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-muted-foreground">
                  {selected.origin} → {selected.destination}
                </p>
                <p className="text-xs text-muted-foreground">{selected.date}</p>
              </div>
            </div>

            {selected.loading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Modelling contrails…
              </div>
            ) : selected.error ? (
              <p className="text-xs text-muted-foreground">{selected.error}</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {selected.contrailProbability !== null && (
                  <div className="rounded-md bg-background px-3 py-2">
                    <p className="text-xs text-muted-foreground">Contrail risk</p>
                    <p className="text-lg font-bold tabular-nums">
                      {Math.round(selected.contrailProbability * 100)}
                      <span className="text-xs font-normal text-muted-foreground">%</span>
                    </p>
                  </div>
                )}
                {selected.co2Kg !== null && (
                  <div className="rounded-md bg-background px-3 py-2">
                    <p className="text-xs text-muted-foreground">CO₂ / pax</p>
                    <p className="text-lg font-bold tabular-nums">
                      {Math.round(selected.co2Kg)}
                      <span className="text-xs font-normal text-muted-foreground"> kg</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Flight list */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <FlightPicker
            onSelect={handleFlightSelect}
            isLoading={selected?.loading ?? false}
          />
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <PlaygroundMap ref={mapRef} />
      </div>
    </div>
  );
}
