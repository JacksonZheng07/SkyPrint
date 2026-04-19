"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PlaygroundMapHandle } from "./components/PlaygroundMap";
import { DarkFlightList } from "./components/DarkFlightList";
import { AtmosphericOverview } from "./components/AtmosphericOverview";
import { ContrailRiskLegend } from "./components/ContrailRiskLegend";
import { PlaygroundBottomBar } from "./components/PlaygroundBottomBar";
import type { FlightSelection } from "@/components/shared/flight-picker";

const PlaygroundMap = dynamic(() => import("./components/PlaygroundMap"), { ssr: false });

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
  const [activeLayer, setActiveLayer] = useState("map");
  const [currentHour, setCurrentHour] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentHourRef = useRef(currentHour);
  useEffect(() => { currentHourRef.current = currentHour; }, [currentHour]);

  // Play auto-advance
  useEffect(() => {
    if (!isPlaying) {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      return;
    }
    playIntervalRef.current = setInterval(() => {
      const next = parseFloat((currentHourRef.current + 0.25).toFixed(2));
      if (next > 24) {
        setIsPlaying(false);
        return;
      }
      setCurrentHour(next);
      mapRef.current?.setProgress(next);
    }, 200);
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current); };
  }, [isPlaying]);

  async function handleFlightSelect(flight: FlightSelection) {
    setIsPlaying(false);
    setCurrentHour(10);
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

    mapRef.current?.showRoute(flight.origin, flight.destination, flight.date, 10);

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
        const probability = data.baseline?.summary?.contrailProbability ?? null;
        const co2Kg = data.baseline?.co2Kg ?? null;
        setSelected((prev) =>
          prev ? { ...prev, loading: false, contrailProbability: probability, co2Kg } : null
        );
        if (probability !== null) mapRef.current?.updateRouteRisk(probability);
      } else {
        setSelected((prev) => prev ? { ...prev, loading: false, error: "Simulation unavailable" } : null);
      }
    } catch {
      setSelected((prev) => prev ? { ...prev, loading: false, error: "Simulation unavailable" } : null);
    }
  }

  function handleHourChange(h: number) {
    setCurrentHour(h);
    mapRef.current?.setProgress(h);
  }

  function handleAnimate() {
    if (!selected) return;
    setIsPlaying(false);
    mapRef.current?.showRoute(selected.origin, selected.destination, selected.date, currentHour);
  }

  return (
    // No pt-14 — globe fills the full screen, panels float over it
    <div className="fixed inset-0 bg-black">
      {/* Globe — full screen, renders behind all panels including the navbar */}
      <PlaygroundMap
        ref={mapRef}
        onProgress={(h) => setCurrentHour(h)}
      />

      {/* Aurora overlay — teal/green glow concentrated around the left panel */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 560px 700px at 160px 55%, rgba(45,212,191,0.09) 0%, transparent 70%),
            radial-gradient(ellipse 280px 400px at 0px 40%,  rgba(16,185,129,0.07) 0%, transparent 65%),
            radial-gradient(ellipse 900px 300px at 320px 0%, rgba(45,212,191,0.05) 0%, transparent 60%)
          `,
        }}
      />

      {/* Left glass panel — floats over the globe, h-14 spacer clears the navbar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-80 z-20 flex flex-col backdrop-blur-[10px] border-r border-teal-400/20"
        style={{
          background: "rgba(8, 14, 28, 0.65)",
          boxShadow: "inset -1px 0 0 rgba(45,212,191,0.30), 2px 0 48px rgba(45,212,191,0.12), inset 0 0 60px rgba(45,212,191,0.04)",
        }}
      >
        {/* Spacer so content doesn't collide with the fixed navbar */}
        <div className="h-14 shrink-0" />

        <div className="border-b border-white/10 px-4 py-4">
          <h2 className="text-sm font-bold text-white">Flight Playground</h2>
          <p className="mt-0.5 text-xs text-white/40">
            Pick a flight to model its contrail impact
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          <DarkFlightList
            onSelect={handleFlightSelect}
            isLoading={selected?.loading ?? false}
            selectedCallsign={selected?.callsign ?? null}
          />
        </div>
      </div>

      {/* Top-right: Atmospheric Overview */}
      <div className="absolute top-16 right-4 z-20 pointer-events-auto">
        <AtmosphericOverview
          contrailProbability={selected?.contrailProbability ?? null}
          co2Kg={selected?.co2Kg ?? null}
          loading={selected?.loading ?? false}
        />
      </div>

      {/* Right-center: Contrail Risk Legend — vertically centered on right */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-auto">
        <ContrailRiskLegend />
      </div>

      {/* Bottom bar — starts after left panel (left-80 = 320px) */}
      <div className="absolute bottom-0 left-80 right-0 z-20">
        <PlaygroundBottomBar
          flightDate={selected?.date ?? null}
          currentHour={currentHour}
          onHourChange={handleHourChange}
          onAnimate={handleAnimate}
          activeLayer={activeLayer}
          onLayerChange={(layer) => { setActiveLayer(layer); mapRef.current?.setLayer(layer); }}
          isPlaying={isPlaying}
          onPlayToggle={() => setIsPlaying((p) => !p)}
        />
      </div>
    </div>
  );
}
