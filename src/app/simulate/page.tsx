"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, type Variants } from "framer-motion";
import type { PlaygroundMapHandle } from "@/app/playground/components/PlaygroundMap";
import { useSimulation } from "@/hooks/use-simulation";
import type { AircraftType } from "@/lib/types/flight";
import type { SimulationResult } from "@/lib/types/comparison";
import { formatCo2 } from "@/lib/utils/format";

const PlaygroundMap = dynamic(
  () => import("@/app/playground/components/PlaygroundMap"),
  { ssr: false }
);

const AIRCRAFT_OPTIONS: { value: AircraftType; label: string; short: string }[] = [
  { value: "B738", label: "Boeing 737-800", short: "737-800" },
  { value: "B789", label: "Boeing 787-9", short: "787-9" },
  { value: "B77W", label: "Boeing 777-300ER", short: "777-300ER" },
  { value: "A320", label: "Airbus A320", short: "A320" },
  { value: "A321", label: "Airbus A321", short: "A321" },
  { value: "A359", label: "Airbus A350-900", short: "A350-900" },
  { value: "A332", label: "Airbus A330-200", short: "A330-200" },
];

const AIRLINE_AIRCRAFT: Record<string, AircraftType> = {
  AAL: "B77W", BAW: "B77W", DAL: "B77W", UAL: "B77W",
  VIR: "A332", DLH: "A333" as AircraftType, AFR: "B77W", KLM: "B77W",
};

const AIRLINE_LOGOS: Record<string, { name: string; color: string }> = {
  DAL: { name: "Delta Air Lines", color: "bg-red-600" },
  KLM: { name: "KLM Royal Dutch Airlines", color: "bg-sky-500" },
  BAW: { name: "British Airways", color: "bg-blue-800" },
  VIR: { name: "Virgin Atlantic", color: "bg-red-500" },
  AAL: { name: "American Airlines", color: "bg-sky-600" },
  UAL: { name: "United Airlines", color: "bg-blue-700" },
  DLH: { name: "Lufthansa", color: "bg-yellow-600" },
  AFR: { name: "Air France", color: "bg-blue-600" },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};
const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export default function SimulatePage() {
  const { result, isLoading, error, simulate } = useSimulation();
  const mapRef = useRef<PlaygroundMapHandle>(null);

  // Form state
  const [origin, setOrigin] = useState("JFK");
  const [destination, setDestination] = useState("LHR");
  const [date, setDate] = useState(todayISO());
  const [aircraftType, setAircraftType] = useState<AircraftType>("B789");
  const [cruiseAlt, setCruiseAlt] = useState(35000);
  const [resultTab, setResultTab] = useState<"baseline" | "optimized">("baseline");

  // When simulation result arrives, show both routes on the map
  useEffect(() => {
    if (!result) return;
    const o = origin.toUpperCase();
    const d = destination.toUpperCase();
    const effectiveDate = date || todayISO();
    // Baseline route (blue dashed) — the original great-circle path
    mapRef.current?.showBaselineRoute(o, d);
    // Optimized route (green solid) — animated
    mapRef.current?.showRoute(o, d, effectiveDate, 10);
  }, [result]);

  // Quick simulation flights
  const [quickFlights, setQuickFlights] = useState<QuickFlight[]>([]);
  useEffect(() => {
    fetch("/api/flights")
      .then((r) => r.json())
      .then((data) => {
        const flights = (data.flights ?? []).slice(0, 8).map((f: ManifestFlight) => ({
          callsign: f.callsign.trim(),
          airline: f.airline,
          origin: ICAO_TO_IATA_SHORT[f.dep] ?? f.dep,
          destination: ICAO_TO_IATA_SHORT[f.arr] ?? f.arr,
          date: new Date(f.first_seen * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }),
          dateRaw: new Date(f.first_seen * 1000).toISOString().split("T")[0],
        }));
        setQuickFlights(flights);
      })
      .catch(() => {});
  }, []);

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function handleSimulate() {
    if (!origin || !destination) return;
    const effectiveDate = date || todayISO();
    simulate({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      aircraftType,
      departureTime: new Date(`${effectiveDate}T10:00:00Z`).toISOString(),
      cruiseAltitudeFt: cruiseAlt,
    });
  }

  function handleQuickSelect(f: QuickFlight) {
    setOrigin(f.origin);
    setDestination(f.destination);
    setDate(f.dateRaw);
    setAircraftType(AIRLINE_AIRCRAFT[f.airline] ?? "B77W");
    simulate({
      origin: f.origin,
      destination: f.destination,
      aircraftType: AIRLINE_AIRCRAFT[f.airline] ?? "B77W",
      departureTime: new Date(`${f.dateRaw}T10:00:00Z`).toISOString(),
      cruiseAltitudeFt: cruiseAlt,
    });
  }

  const selectedAircraft = AIRCRAFT_OPTIONS.find((a) => a.value === aircraftType);

  return (
    <div className="relative -mt-14 min-h-screen bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/SimsImage.png')" }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />

      <motion.div
        className="relative z-10 mx-auto max-w-[1400px] space-y-6 px-4 pb-16 pt-24 sm:px-8"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Header */}
        <motion.div variants={fadeUp}>
          <h1 className="text-3xl font-bold text-white">Simulate Route</h1>
          <p className="mt-1 text-sm text-white/50">
            Visualize how altitude optimization reduces contrail formation while minimizing fuel penalties.
          </p>
        </motion.div>

        {/* Input bar */}
        <motion.div variants={fadeUp}>
          <div className="flex flex-col gap-px overflow-hidden rounded-xl border border-white/15 bg-white/5 backdrop-blur-xl lg:flex-row lg:items-stretch">
            {/* From */}
            <div className="flex flex-1 flex-col gap-0.5 border-b border-white/10 px-5 py-4 lg:border-b-0 lg:border-r">
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">From</span>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                <input
                  placeholder="JFK"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  maxLength={3}
                  className="w-full bg-transparent text-lg font-bold uppercase text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-white/30">{CITY_NAMES[origin.toUpperCase()] ?? ""}</span>
            </div>

            {/* Swap button */}
            <div className="hidden lg:flex items-center -mx-3 z-10">
              <button onClick={handleSwap} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/60 transition-colors hover:bg-white/20">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </button>
            </div>

            {/* To */}
            <div className="flex flex-1 flex-col gap-0.5 border-b border-white/10 px-5 py-4 lg:border-b-0 lg:border-r">
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">To</span>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 rotate-90 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                <input
                  placeholder="LHR"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  maxLength={3}
                  className="w-full bg-transparent text-lg font-bold uppercase text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-white/30">{CITY_NAMES[destination.toUpperCase()] ?? ""}</span>
            </div>

            {/* Date */}
            <div className="flex flex-col gap-0.5 border-b border-white/10 px-5 py-4 lg:border-b-0 lg:border-r">
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">Date</span>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <div className="relative">
                  <span className="text-lg font-bold text-white">{formatDateShort(date)}</span>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
                </div>
              </div>
            </div>

            {/* Aircraft */}
            <div className="flex flex-col gap-0.5 border-b border-white/10 px-5 py-4 lg:border-b-0 lg:border-r">
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">Aircraft</span>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                <select
                  value={aircraftType}
                  onChange={(e) => setAircraftType(e.target.value as AircraftType)}
                  className="bg-transparent text-lg font-bold text-white focus:outline-none appearance-none cursor-pointer"
                >
                  {AIRCRAFT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.value}</option>
                  ))}
                </select>
              </div>
              <span className="text-[10px] text-white/30">{selectedAircraft?.label ?? ""}</span>
            </div>

            {/* Cruise Altitude */}
            <div className="flex flex-col gap-0.5 border-b border-white/10 px-5 py-4 lg:border-b-0 lg:border-r">
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">Cruise Altitude (ft)</span>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5-4.5L16.5 16.5m0 0L12 12m4.5 4.5V3" />
                </svg>
                <span className="text-lg font-bold text-white">{cruiseAlt.toLocaleString()} ft</span>
              </div>
              <input
                type="range"
                min={28000}
                max={42000}
                step={1000}
                value={cruiseAlt}
                onChange={(e) => setCruiseAlt(Number(e.target.value))}
                className="mt-1 w-full accent-emerald-500"
              />
              <div className="flex justify-between text-[9px] text-white/30">
                <span>28,000</span>
                <span>42,000</span>
              </div>
            </div>

            {/* Simulate button */}
            <div className="flex items-center px-4 py-4">
              <button
                onClick={handleSimulate}
                disabled={isLoading || !origin || !destination}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 font-medium text-white shadow-lg transition-colors hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-50 lg:w-auto whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Simulating...
                  </>
                ) : (
                  <>
                    Simulate Route
                    <span aria-hidden="true">&rarr;</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div variants={fadeUp} className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 backdrop-blur-xl">
            {error}
          </motion.div>
        )}

        {/* Map + Results side by side */}
        <motion.div variants={fadeUp} className="grid gap-4 lg:grid-cols-[1fr_380px]">
          {/* Map */}
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl" style={{ minHeight: 480 }}>
            <PlaygroundMap ref={mapRef} />

            {/* Route label overlay */}
            {result && (
              <div className="pointer-events-none absolute left-4 top-4 text-sm font-semibold text-white/80">
                {origin.toUpperCase()} &rarr; {destination.toUpperCase()}
              </div>
            )}

            {/* Legend overlay */}
            {result && (
              <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-4 rounded-lg border border-white/10 bg-black/60 px-4 py-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-5 border-t-2 border-dashed border-sky-400" />
                  <span className="text-[11px] text-white/60">Baseline Route</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-5 bg-emerald-400" />
                  <span className="text-[11px] text-white/60">Optimized Route</span>
                </div>
              </div>
            )}

            {/* Contrail risk bar */}
            {result && (
              <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-lg border border-white/10 bg-black/60 px-4 py-2 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                  </svg>
                  <span className="text-[11px] text-white/50">Contrail risk zones</span>
                </div>
                <div className="h-2 w-24 rounded-full bg-gradient-to-r from-sky-500 via-amber-500 to-red-500" />
                <div className="flex justify-between text-[9px] text-white/40 w-12">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!result && !isLoading && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-white/30">Enter a route and click Simulate to see results</p>
              </div>
            )}

            {/* Loading overlay */}
            {isLoading && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
                  <p className="mt-3 text-sm text-white/50">Running altitude optimization...</p>
                </div>
              </div>
            )}
          </div>

          {/* Simulation Results panel */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-white">Simulation Results</h3>
            <p className="text-[11px] text-white/40">Comparison: Baseline vs Optimized</p>

            {result ? (
              <SimulationResults result={result} tab={resultTab} onTabChange={setResultTab} />
            ) : (
              <div className="mt-8 flex flex-col items-center gap-3 text-center">
                <svg className="h-12 w-12 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                <p className="text-sm text-white/30">Results will appear here after simulation</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Simulations */}
        <motion.div variants={fadeUp} className="space-y-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Quick Simulations</h2>
            <p className="text-sm text-white/40">Or pick a recent transatlantic flight to simulate</p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-lg">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              placeholder="Search by flight number, airline, or airport..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 backdrop-blur-xl focus:border-white/20 focus:outline-none"
            />
          </div>

          {/* Horizontal flight cards */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {quickFlights.length > 0
              ? quickFlights.map((f) => (
                  <QuickFlightCard key={`${f.callsign}-${f.dateRaw}`} flight={f} onSelect={handleQuickSelect} />
                ))
              : FALLBACK_FLIGHTS.map((f) => (
                  <QuickFlightCard key={`${f.callsign}-${f.dateRaw}`} flight={f} onSelect={handleQuickSelect} />
                ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ===== Simulation Results Panel ===== */

function SimulationResults({
  result,
  tab,
  onTabChange,
}: {
  result: SimulationResult;
  tab: "baseline" | "optimized";
  onTabChange: (t: "baseline" | "optimized") => void;
}) {
  const { baseline, optimized, efReductionPercent, fuelPenaltyPercent } = result;
  const co2Delta = optimized.co2Kg - baseline.co2Kg;
  const co2DeltaPct = baseline.co2Kg > 0 ? (co2Delta / baseline.co2Kg) * 100 : 0;
  const contrailBaselineRisk = baseline.summary.contrailProbability;
  const contrailOptimizedRisk = optimized.summary.contrailProbability;
  const contrailReductionPct = contrailBaselineRisk > 0
    ? Math.round(((contrailBaselineRisk - contrailOptimizedRisk) / contrailBaselineRisk) * 100)
    : 0;

  const baselineImpact = (baseline.co2Kg / 30 + baseline.summary.contrailProbability * 6).toFixed(1);
  const optimizedImpact = (optimized.co2Kg / 30 + optimized.summary.contrailProbability * 6).toFixed(1);
  const impactReductionPct = Number(baselineImpact) > 0
    ? Math.round(((Number(baselineImpact) - Number(optimizedImpact)) / Number(baselineImpact)) * 100)
    : 0;

  // Best altitude adjustment insight
  const adj = result.altitudeAdjustments[0];

  return (
    <div className="mt-4 space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => onTabChange("baseline")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            tab === "baseline" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"
          }`}
        >
          Baseline Route
        </button>
        <button
          onClick={() => onTabChange("optimized")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            tab === "optimized" ? "bg-emerald-500/20 text-emerald-400" : "text-white/40 hover:text-white/60"
          }`}
        >
          Optimized Route
        </button>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        {/* CO2 */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
            <svg className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs text-white/40">CO₂ Emissions</p>
            <p className="text-[10px] text-white/30">per passenger</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="font-bold text-white">{Math.round(baseline.co2Kg)} kg</span>
            <span className="font-bold text-white">{Math.round(optimized.co2Kg)} kg</span>
            <span className={`text-xs font-medium ${co2Delta > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {co2Delta > 0 ? "+" : ""}{co2DeltaPct.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Contrail Impact */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
            <svg className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs text-white/40">Contrail Impact</p>
            <p className="text-[10px] text-white/30">relative</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className={`font-bold ${contrailBaselineRisk > 0.5 ? "text-red-400" : contrailBaselineRisk > 0.25 ? "text-amber-400" : "text-emerald-400"}`}>
              {contrailBaselineRisk > 0.5 ? "High" : contrailBaselineRisk > 0.25 ? "Med" : "Low"}
            </span>
            <span className={`font-bold ${contrailOptimizedRisk > 0.5 ? "text-red-400" : contrailOptimizedRisk > 0.25 ? "text-amber-400" : "text-emerald-400"}`}>
              {contrailOptimizedRisk > 0.5 ? "High" : contrailOptimizedRisk > 0.25 ? "Med" : "Low"}
            </span>
            <span className="text-xs font-medium text-emerald-400">-{contrailReductionPct}%</span>
          </div>
        </div>

        {/* Total Climate Impact */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
            <svg className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs text-white/40">Total Climate Impact</p>
            <p className="text-[10px] text-white/30">score (lower is better)</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-xs font-bold text-white">{baselineImpact}</span>
            <span className="text-white/30">&rarr;</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-400">{optimizedImpact}</span>
            <span className="text-xs font-medium text-emerald-400">-{impactReductionPct}%</span>
          </div>
        </div>
      </div>

      {/* Insight callout */}
      {adj && (
        <div className="flex gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
          <svg className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
          <p className="text-xs leading-relaxed text-white/60">
            Lowering altitude by {Math.abs(adj.suggestedAltitudeFt - adj.originalAltitudeFt).toLocaleString()} ft avoids ice supersaturated regions, reducing contrail formation significantly with minimal fuel penalty.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button className="rounded-lg border border-white/10 bg-white/5 py-2.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/10">
          View Full Report
        </button>
        <button className="rounded-lg bg-emerald-600 py-2.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700">
          Save Simulation
        </button>
      </div>
    </div>
  );
}

/* ===== Quick Flight Card ===== */

interface QuickFlight {
  callsign: string;
  airline: string;
  origin: string;
  destination: string;
  date: string;
  dateRaw: string;
}

interface ManifestFlight {
  icao24: string;
  callsign: string;
  airline: string;
  dep: string;
  arr: string;
  first_seen: number;
  last_seen: number;
}

function QuickFlightCard({ flight, onSelect }: { flight: QuickFlight; onSelect: (f: QuickFlight) => void }) {
  const logo = AIRLINE_LOGOS[flight.airline];
  return (
    <button
      onClick={() => onSelect(flight)}
      className="flex shrink-0 flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10"
      style={{ minWidth: 180 }}
    >
      <div className="flex items-center gap-2.5">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold text-white ${logo?.color ?? "bg-white/20"}`}>
          {flight.airline.slice(0, 2)}
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-white">{flight.callsign}</p>
          <p className="text-[10px] text-white/40">{logo?.name ?? flight.airline}</p>
        </div>
      </div>
      <div className="text-left">
        <p className="text-xs font-medium text-white/70">{flight.origin} &rarr; {flight.destination}</p>
        <p className="text-[10px] text-white/30">{flight.date}</p>
      </div>
    </button>
  );
}

/* ===== Constants ===== */

const CITY_NAMES: Record<string, string> = {
  JFK: "New York, NY",
  LHR: "London, UK",
  LAX: "Los Angeles, CA",
  SFO: "San Francisco, CA",
  ORD: "Chicago, IL",
  ATL: "Atlanta, GA",
  BOS: "Boston, MA",
  DFW: "Dallas, TX",
  MIA: "Miami, FL",
  SEA: "Seattle, WA",
  DEN: "Denver, CO",
  CDG: "Paris, France",
  AMS: "Amsterdam, NL",
  FRA: "Frankfurt, DE",
  DUB: "Dublin, IE",
  MAD: "Madrid, ES",
  ZRH: "Zurich, CH",
  NRT: "Tokyo, JP",
  SIN: "Singapore",
  DXB: "Dubai, UAE",
  MAN: "Manchester, UK",
  FCO: "Rome, IT",
  BCN: "Barcelona, ES",
  LIS: "Lisbon, PT",
};

const ICAO_TO_IATA_SHORT: Record<string, string> = {
  KJFK: "JFK", EGLL: "LHR", KLAX: "LAX", KSFO: "SFO", KORD: "ORD",
  KATL: "ATL", KBOS: "BOS", KDFW: "DFW", KMIA: "MIA", KSEA: "SEA",
  KDEN: "DEN", LFPG: "CDG", EHAM: "AMS", EDDF: "FRA", EIDW: "DUB",
  LEMD: "MAD", LSZH: "ZRH", RJTT: "NRT", WSSS: "SIN", OMDB: "DXB",
  EGCC: "MAN", LIRF: "FCO", LEBL: "BCN", LPPT: "LIS",
};

const FALLBACK_FLIGHTS: QuickFlight[] = [
  { callsign: "DAL44", airline: "DAL", origin: "JFK", destination: "DUB", date: "Apr 1, 2026", dateRaw: "2026-04-01" },
  { callsign: "KLM644", airline: "KLM", origin: "JFK", destination: "AMS", date: "Apr 1, 2026", dateRaw: "2026-04-01" },
  { callsign: "BAW172", airline: "BAW", origin: "JFK", destination: "LHR", date: "Apr 1, 2026", dateRaw: "2026-04-01" },
  { callsign: "VIR154", airline: "VIR", origin: "JFK", destination: "LHR", date: "Apr 1, 2026", dateRaw: "2026-04-01" },
  { callsign: "DAL126", airline: "DAL", origin: "JFK", destination: "MAD", date: "Apr 1, 2026", dateRaw: "2026-04-01" },
  { callsign: "DAL52", airline: "DAL", origin: "JFK", destination: "ZRH", date: "Apr 1, 2026", dateRaw: "2026-04-01" },
];

function formatDateShort(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}
