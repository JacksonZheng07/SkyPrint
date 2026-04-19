"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import * as Plot from "@observablehq/plot";
import { motion, AnimatePresence, useSpring, useTransform, type Variants } from "framer-motion";
import type { PlaygroundMapHandle } from "@/app/playground/components/PlaygroundMap";
import { useSimulation } from "@/hooks/use-simulation";
import type { AircraftType } from "@/lib/types/flight";
import type { SimulationResult } from "@/lib/types/comparison";

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

  const [origin, setOrigin] = useState("JFK");
  const [destination, setDestination] = useState("LHR");
  const [date, setDate] = useState(todayISO());
  const [aircraftType, setAircraftType] = useState<AircraftType>("B789");
  const [cruiseAlt, setCruiseAlt] = useState(35000);
  const [resultTab, setResultTab] = useState<"baseline" | "optimized">("baseline");
  const [isNight, setIsNight] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [airlineFilter, setAirlineFilter] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSimulatedOnce = useRef(false);

  const triggerSimulate = useCallback((o: string, d: string, dt: string, ac: AircraftType, alt: number, night: boolean) => {
    if (!o || !d || o.length < 3 || d.length < 3) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const effectiveDate = dt || todayISO();
      simulate({
        origin: o.toUpperCase(),
        destination: d.toUpperCase(),
        aircraftType: ac,
        departureTime: new Date(`${effectiveDate}${night ? "T02:00:00Z" : "T10:00:00Z"}`).toISOString(),
        cruiseAltitudeFt: alt,
      });
      hasSimulatedOnce.current = true;
    }, hasSimulatedOnce.current ? 400 : 0);
  }, [simulate]);

  useEffect(() => {
    if (!hasSimulatedOnce.current) return;
    triggerSimulate(origin, destination, date, aircraftType, cruiseAlt, isNight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aircraftType, date, cruiseAlt]);

  // When result arrives: draw routes + update map risk for current tab
  useEffect(() => {
    if (!result) return;
    const o = origin.toUpperCase();
    const d = destination.toUpperCase();
    const effectiveDate = date || todayISO();
    mapRef.current?.showBaselineRoute(o, d);
    mapRef.current?.showRoute(o, d, effectiveDate, isNight ? 2 : 10);
    // Set risk color to match current tab
    const prob = resultTab === "optimized"
      ? result.optimized.summary.contrailProbability
      : result.baseline.summary.contrailProbability;
    mapRef.current?.updateRouteRisk(prob);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  // Tab change → update map risk color immediately
  function handleTabChange(tab: "baseline" | "optimized") {
    setResultTab(tab);
    if (!result) return;
    const prob = tab === "optimized"
      ? result.optimized.summary.contrailProbability
      : result.baseline.summary.contrailProbability;
    mapRef.current?.updateRouteRisk(prob);
  }

  const [quickFlights, setQuickFlights] = useState<QuickFlight[]>([]);
  useEffect(() => {
    fetch("/api/flights")
      .then((r) => r.json())
      .then((data) => {
        const flights = (data.flights ?? []).slice(0, 12).map((f: ManifestFlight) => ({
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
      departureTime: new Date(`${effectiveDate}${isNight ? "T02:00:00Z" : "T10:00:00Z"}`).toISOString(),
      cruiseAltitudeFt: cruiseAlt,
    });
    hasSimulatedOnce.current = true;
  }

  function handleQuickSelect(f: QuickFlight) {
    setOrigin(f.origin);
    setDestination(f.destination);
    setDate(f.dateRaw);
    setSelectedFlight(f.callsign);
    const ac = AIRLINE_AIRCRAFT[f.airline] ?? "B77W";
    setAircraftType(ac);
    simulate({
      origin: f.origin,
      destination: f.destination,
      aircraftType: ac,
      departureTime: new Date(`${f.dateRaw}${isNight ? "T02:00:00Z" : "T10:00:00Z"}`).toISOString(),
      cruiseAltitudeFt: cruiseAlt,
    });
    hasSimulatedOnce.current = true;
  }

  function handleSave() {
    if (!result) return;
    const saved = JSON.parse(localStorage.getItem("skyprint_simulations") ?? "[]");
    saved.unshift({
      id: Date.now(),
      origin,
      destination,
      date,
      aircraftType,
      isNight,
      cruiseAlt,
      efReductionPercent: result.efReductionPercent,
      fuelPenaltyPercent: result.fuelPenaltyPercent,
      co2Baseline: result.baseline.co2Kg,
      co2Optimized: result.optimized.co2Kg,
      contrailBaselineRisk: result.baseline.summary.contrailProbability,
      contrailOptimizedRisk: result.optimized.summary.contrailProbability,
      savedAt: new Date().toISOString(),
    });
    localStorage.setItem("skyprint_simulations", JSON.stringify(saved.slice(0, 20)));
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  }

  const displayFlights = (quickFlights.length > 0 ? quickFlights : FALLBACK_FLIGHTS)
    .filter((f) => !airlineFilter || f.airline === airlineFilter);

  const availableAirlines = [...new Set((quickFlights.length > 0 ? quickFlights : FALLBACK_FLIGHTS).map((f) => f.airline))];
  const selectedAircraft = AIRCRAFT_OPTIONS.find((a) => a.value === aircraftType);

  return (
    <div className="relative -mt-14 min-h-screen bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/SimsImage.png')" }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />

      {/* Save toast */}
      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-5 py-3 text-sm font-medium text-emerald-300 shadow-2xl backdrop-blur-xl"
          >
            ✓ Simulation saved
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full report modal */}
      <AnimatePresence>
        {showReport && result && (
          <ReportModal
            result={result}
            origin={origin}
            destination={destination}
            date={date}
            aircraftType={aircraftType}
            isNight={isNight}
            onClose={() => setShowReport(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="relative z-10 mx-auto max-w-[1400px] space-y-6 px-4 pb-16 pt-24 sm:px-8"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">Simulate Route</h1>
          <p className="max-w-xl text-sm leading-relaxed text-white/50">
            Visualize how altitude optimization reduces contrail formation while minimizing fuel penalties.
          </p>
        </motion.div>

        {/* Input bar */}
        <motion.div variants={fadeUp}>
          <div className="flex flex-col gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-2xl shadow-black/20 backdrop-blur-2xl lg:flex-row lg:items-stretch">
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
                  onChange={(e) => { setOrigin(e.target.value); setSelectedFlight(null); }}
                  maxLength={3}
                  className="w-full bg-transparent text-lg font-bold uppercase text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-white/30">{CITY_NAMES[origin.toUpperCase()] ?? ""}</span>
            </div>

            {/* Swap */}
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
                  onChange={(e) => { setDestination(e.target.value); setSelectedFlight(null); }}
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
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">Cruise Alt (ft)</span>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5-4.5L16.5 16.5m0 0L12 12m4.5 4.5V3" />
                </svg>
                <span className="text-lg font-bold text-white">{cruiseAlt.toLocaleString()}</span>
              </div>
              <input type="range" min={28000} max={42000} step={1000} value={cruiseAlt}
                onChange={(e) => setCruiseAlt(Number(e.target.value))}
                className="mt-1 w-full accent-emerald-500" />
              <span className={`text-[9px] font-medium ${cruiseAlt >= 35000 ? "text-red-400" : cruiseAlt >= 32000 ? "text-amber-400" : "text-emerald-400"}`}>
                {cruiseAlt >= 35000 ? "High contrail zone" : cruiseAlt >= 32000 ? "Moderate zone" : "Low contrail zone"}
              </span>
            </div>

            {/* Day / Night toggle */}
            <div className="flex flex-col gap-0.5 border-b border-white/10 px-5 py-4 lg:border-b-0 lg:border-r">
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">Time of Day</span>
              <button
                onClick={() => {
                  const next = !isNight;
                  setIsNight(next);
                  if (hasSimulatedOnce.current) triggerSimulate(origin, destination, date, aircraftType, cruiseAlt, next);
                }}
                className={`mt-1 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  isNight ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/40" : "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/40"
                }`}
              >
                <span>{isNight ? "🌙" : "☀️"}</span>
                <span>{isNight ? "Night" : "Day"}</span>
              </button>
              <span className={`mt-1 text-[9px] leading-snug ${isNight ? "text-indigo-400/80" : "text-white/30"}`}>
                {isNight ? "μ₀ = 0 · no shortwave cooling" : "Daytime · shortwave partially cancels"}
              </span>
            </div>

            {/* Simulate button */}
            <div className="flex items-center px-4 py-4">
              <button
                onClick={handleSimulate}
                disabled={isLoading || !origin || !destination}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 font-medium text-white shadow-lg transition-colors hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-50 lg:w-auto whitespace-nowrap"
              >
                {isLoading ? (
                  <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Simulating...</>
                ) : (
                  <>Simulate Route <span aria-hidden="true">&rarr;</span></>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div variants={fadeUp} className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 backdrop-blur-xl">
            {error}
          </motion.div>
        )}

        {/* Map + Results */}
        <motion.div variants={fadeUp} className="grid gap-4 lg:grid-cols-[1fr_400px]">
          {/* Map */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl shadow-black/20 backdrop-blur-xl" style={{ minHeight: 480 }}>
            <PlaygroundMap ref={mapRef} />

            {result && (
              <div className="pointer-events-none absolute left-4 top-4 text-sm font-semibold text-white/80">
                {origin.toUpperCase()} &rarr; {destination.toUpperCase()}
                {selectedFlight && <span className="ml-2 text-xs font-normal text-white/40">{selectedFlight}</span>}
              </div>
            )}

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

            {result && (
              <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-lg border border-white/10 bg-black/60 px-4 py-2 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                  </svg>
                  <span className="text-[11px] text-white/50">Contrail risk</span>
                </div>
                <div className="h-2 w-20 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500" />
                <div className="flex justify-between text-[9px] text-white/40 w-10">
                  <span>Low</span><span>High</span>
                </div>
              </div>
            )}

            {!result && !isLoading && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
                <svg className="h-10 w-10 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                <p className="text-sm text-white/30">Select a flight below or enter a route to simulate</p>
              </div>
            )}

            {isLoading && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
                  <p className="mt-3 text-sm text-white/50">Running altitude optimization...</p>
                </div>
              </div>
            )}
          </div>

          {/* Results panel */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Simulation Results</h3>
                <p className="text-[11px] text-white/40">Baseline vs Optimized</p>
              </div>
            </div>

            {result ? (
              <SimulationResults
                result={result}
                tab={resultTab}
                onTabChange={handleTabChange}
                isLoading={isLoading}
                isNight={isNight}
                onSave={handleSave}
                onViewReport={() => setShowReport(true)}
              />
            ) : (
              <div className="mt-10 flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03]">
                  <svg className="h-7 w-7 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <p className="text-sm text-white/30">Select a flight below or enter a route above</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Simulations */}
        <motion.div variants={fadeUp} className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">Quick Simulations</h2>
              <p className="mt-1 text-sm text-white/40">Pick a real transatlantic flight to simulate</p>
            </div>
          </div>

          {/* Airline filter pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAirlineFilter(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!airlineFilter ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70 border border-white/10"}`}
            >
              All
            </button>
            {availableAirlines.map((al) => (
              <button
                key={al}
                onClick={() => setAirlineFilter(airlineFilter === al ? null : al)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${airlineFilter === al ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70 border border-white/10"}`}
              >
                {AIRLINE_LOGOS[al]?.name ?? al}
              </button>
            ))}
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {displayFlights.map((f) => (
              <QuickFlightCard
                key={`${f.callsign}-${f.dateRaw}`}
                flight={f}
                isSelected={selectedFlight === f.callsign}
                onSelect={handleQuickSelect}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ===== Animated Number ===== */

function AnimatedNumber({ value, decimals = 0, suffix = "", className = "" }: { value: number; decimals?: number; suffix?: string; className?: string }) {
  const spring = useSpring(value, { stiffness: 120, damping: 20, mass: 0.5 });
  const display = useTransform(spring, (v) => `${decimals > 0 ? v.toFixed(decimals) : Math.round(v)}${suffix}`);
  useEffect(() => { spring.set(value); }, [spring, value]);
  return <motion.span className={className}>{display}</motion.span>;
}

/* ===== Simulation Results Panel ===== */

function SimulationResults({
  result, tab, onTabChange, isLoading, isNight, onSave, onViewReport,
}: {
  result: SimulationResult;
  tab: "baseline" | "optimized";
  onTabChange: (t: "baseline" | "optimized") => void;
  isLoading?: boolean;
  isNight: boolean;
  onSave: () => void;
  onViewReport: () => void;
}) {
  const { baseline, optimized } = result;
  const co2Delta = optimized.co2Kg - baseline.co2Kg;
  const co2DeltaPct = baseline.co2Kg > 0 ? (co2Delta / baseline.co2Kg) * 100 : 0;

  const contrailBaseRisk = baseline.summary.contrailProbability;
  const contrailOptRisk = optimized.summary.contrailProbability;
  const contrailReductionPct = contrailBaseRisk > 0
    ? Math.round(((contrailBaseRisk - contrailOptRisk) / contrailBaseRisk) * 100)
    : 0;

  const baseImpact = baseline.co2Kg / 30 + contrailBaseRisk * 6;
  const optImpact = optimized.co2Kg / 30 + contrailOptRisk * 6;
  const impactReductionPct = baseImpact > 0 ? Math.round(((baseImpact - optImpact) / baseImpact) * 100) : 0;

  // Minutes added estimate: 1% fuel penalty ≈ ~4 min on transatlantic
  const minutesAdded = Math.max(1, Math.round(result.fuelPenaltyPercent * 4));

  // Cars off road per year avoided (contrail warming reduction)
  const contrailWarmingAvoided_tco2e = (baseline.co2Kg / 1000) * 1.8 * (contrailReductionPct / 100);
  const carsAvoided = Math.max(1, Math.round(contrailWarmingAvoided_tco2e / 4.6 * 100));

  const adj = result.altitudeAdjustments[0];

  // Which metric values to show based on tab
  const showBaseline = tab === "baseline";
  const co2Show = showBaseline ? baseline.co2Kg : optimized.co2Kg;
  const riskShow = showBaseline ? contrailBaseRisk : contrailOptRisk;
  const impactShow = showBaseline ? baseImpact : optImpact;

  return (
    <div className="relative mt-4 space-y-3">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/20 backdrop-blur-[2px]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
        <button
          onClick={() => onTabChange("baseline")}
          className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all ${tab === "baseline" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60"}`}
        >
          Baseline Route
        </button>
        <button
          onClick={() => onTabChange("optimized")}
          className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all ${tab === "optimized" ? "bg-emerald-500/20 text-emerald-400 shadow-sm" : "text-white/40 hover:text-white/60"}`}
        >
          Optimized Route
        </button>
      </div>

      {/* Tab context label */}
      <p className="text-[11px] text-white/30">
        {tab === "baseline"
          ? `What this flight does today${isNight ? " (night — no shortwave cooling)" : ""}`
          : "What it could do with altitude adjustment"}
      </p>

      {/* Metrics — single column for active tab */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          {/* CO2 */}
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04]">
              <svg className="h-4 w-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-white/60">CO₂ Emissions</p>
              <p className="text-[10px] text-white/30">per passenger</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white"><AnimatedNumber value={co2Show} /> kg</span>
              {!showBaseline && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${co2Delta > 0 ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                  {co2Delta > 0 ? "+" : ""}<AnimatedNumber value={co2DeltaPct} decimals={1} suffix="%" />
                </span>
              )}
            </div>
          </div>

          {/* Contrail */}
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04]">
              <svg className="h-4 w-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-white/60">Contrail Impact</p>
              <p className="text-[10px] text-white/30">relative risk</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.span
                key={`risk-${tab}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`rounded-md px-2.5 py-0.5 text-sm font-bold ${riskShow > 0.5 ? "bg-red-500/15 text-red-400" : riskShow > 0.25 ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"}`}
              >
                {riskShow > 0.5 ? "High" : riskShow > 0.25 ? "Med" : "Low"}
              </motion.span>
              {!showBaseline && contrailReductionPct > 0 && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  -{contrailReductionPct}%
                </span>
              )}
            </div>
          </div>

          {/* Total Impact */}
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04]">
              <svg className="h-4 w-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-white/60">Total Climate Impact</p>
              <p className="text-[10px] text-white/30">score (lower is better)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${showBaseline ? "border border-white/10 bg-white/[0.04] text-white" : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"}`}>
                <AnimatedNumber value={impactShow} decimals={1} />
              </span>
              {!showBaseline && impactReductionPct > 0 && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">-{impactReductionPct}%</span>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Persuasion card — only on optimized tab */}
      <AnimatePresence>
        {tab === "optimized" && adj && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/70 mb-2">The tradeoff</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xl font-bold text-amber-300">+{minutesAdded} min</p>
                <p className="text-[10px] text-white/40">added flight time</p>
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-400">-{contrailReductionPct}%</p>
                <p className="text-[10px] text-white/40">contrail warming</p>
              </div>
              <div>
                <p className="text-xl font-bold text-teal-300">~{carsAvoided}</p>
                <p className="text-[10px] text-white/40">cars off road / yr</p>
              </div>
            </div>
            <p className="mt-2.5 text-[10px] leading-relaxed text-white/40">
              Lowering altitude by <span className="font-semibold text-emerald-400">{Math.abs((adj.suggestedAltitudeFt - adj.originalAltitudeFt)).toLocaleString()} ft</span> avoids the ISSR band. Small course correction, outsized climate benefit.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Night mode note */}
      {isNight && tab === "baseline" && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.07] px-3 py-2.5">
          <p className="text-[11px] text-indigo-300/80">
            Night flight — shortwave term (RF_sw) is zero. Contrail warming is <span className="font-semibold">~1.3–1.5× higher</span> than an equivalent daytime flight.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={onViewReport}
          className="rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-xs font-medium text-white/60 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
        >
          View Full Report
        </button>
        <button
          onClick={onSave}
          className="rounded-xl bg-emerald-600 py-2.5 text-xs font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/30"
        >
          Save Simulation
        </button>
      </div>
    </div>
  );
}

/* ===== Flight Altitude Profile Chart ===== */

function FlightProfileChart({ result, origin, destination }: {
  result: SimulationResult;
  origin: string;
  destination: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { baseline, optimized, altitudeAdjustments } = result;
  const n = baseline.waypointResults.length;

  useEffect(() => {
    if (!containerRef.current) return;

    const adjustmentMap = new Map(altitudeAdjustments.map((a) => [a.waypointIndex, a.suggestedAltitudeFt]));

    const baselinePoints = Array.from({ length: n }, (_, i) => {
      const f = i / (n - 1);
      const alt = f < 0.1 ? 35000 * (f / 0.1) : f > 0.9 ? 35000 * ((1 - f) / 0.1) : 35000;
      return { x: f, alt, issr: baseline.waypointResults[i].sacSatisfied };
    });

    const optimizedPoints = Array.from({ length: n }, (_, i) => {
      const f = i / (n - 1);
      const base = f < 0.1 ? 35000 * (f / 0.1) : f > 0.9 ? 35000 * ((1 - f) / 0.1) : 35000;
      const adjAlt = adjustmentMap.get(i) ?? adjustmentMap.get(i - 1) ?? adjustmentMap.get(i + 1);
      const delta = (f >= 0.1 && f <= 0.9 && adjAlt != null) ? (adjAlt - 35000) : 0;
      return { x: f, alt: base + delta };
    });

    const issrBands: { x1: number; x2: number }[] = [];
    let bandStart: number | null = null;
    for (let i = 0; i <= n; i++) {
      const inIssr = i < n && baseline.waypointResults[i].sacSatisfied;
      if (inIssr && bandStart === null) bandStart = i / (n - 1);
      if (!inIssr && bandStart !== null) {
        issrBands.push({ x1: bandStart, x2: (i - 1) / (n - 1) });
        bandStart = null;
      }
    }

    const allAlts = [...baselinePoints, ...optimizedPoints].map((p) => p.alt);
    const altMin = Math.max(0, Math.min(...allAlts) - 3000);
    const altMax = Math.max(...allAlts) + 4000;

    const chart = Plot.plot({
      width: containerRef.current.clientWidth,
      height: 160,
      marginLeft: 52,
      marginRight: 12,
      marginTop: 12,
      marginBottom: 28,
      style: { background: "transparent", color: "#fff", fontFamily: "var(--font-geist-mono)" },
      x: { label: null, tickFormat: (d: number) => d === 0 ? origin.toUpperCase() : d === 1 ? destination.toUpperCase() : "", ticks: [0, 1] },
      y: { label: "ft", domain: [altMin, altMax], tickFormat: (d: number) => `${(d / 1000).toFixed(0)}k`, grid: true },
      marks: [
        ...issrBands.map((b) =>
          Plot.rectX([b], { x1: "x1", x2: "x2", y1: altMin, y2: altMax, fill: "#EF4444", fillOpacity: 0.12 })
        ),
        Plot.line(baselinePoints, { x: "x", y: "alt", stroke: "#ef4444", strokeWidth: 1.5, strokeDasharray: "4,3", strokeOpacity: 0.7 }),
        Plot.line(optimizedPoints, { x: "x", y: "alt", stroke: "#00E5CC", strokeWidth: 2 }),
        Plot.dot(optimizedPoints.filter((_, i) => adjustmentMap.has(i)), { x: "x", y: "alt", fill: "#00E5CC", r: 3 }),
        Plot.ruleY([0], { strokeOpacity: 0 }),
      ],
    });

    containerRef.current.replaceChildren(chart);
    return () => chart.remove();
  }, [result, origin, destination, baseline, optimized, altitudeAdjustments, n]);

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Altitude Profile</h3>
        <div className="flex items-center gap-3 text-[10px] text-white/40">
          <span className="flex items-center gap-1.5"><span className="inline-block w-4 border-t-2 border-dashed border-red-400/70" />Baseline</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-4 border-t-2 border-[#00E5CC]" />Optimized</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500/30" />ISSR</span>
        </div>
      </div>
      <div ref={containerRef} className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-2 [&_svg]:max-w-full" />
      <p className="mt-1.5 text-[10px] text-white/25">
        Corrections are typically 1–2k ft — the small divergence between lines is intentional.
      </p>
    </div>
  );
}

/* ===== Full Report Modal ===== */

function ReportModal({ result, origin, destination, date, aircraftType, isNight, onClose }: {
  result: SimulationResult;
  origin: string;
  destination: string;
  date: string;
  aircraftType: string;
  isNight: boolean;
  onClose: () => void;
}) {
  const { baseline, optimized } = result;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0a1628]/95 p-6 shadow-2xl backdrop-blur-xl"
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Full Simulation Report</h2>
            <p className="mt-0.5 text-sm text-white/40">
              {origin.toUpperCase()} → {destination.toUpperCase()} · {aircraftType} · {formatDateShort(date)} · {isNight ? "Night" : "Day"}
            </p>
          </div>
          <button onClick={onClose} className="ml-4 rounded-lg border border-white/10 p-2 text-white/40 hover:text-white transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Summary comparison */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          {[
            { label: "Baseline Route", co2: baseline.co2Kg, risk: baseline.summary.contrailProbability, ef: baseline.summary.totalEnergyForcingJ, tag: "Today", maxAge: baseline.summary.maxContrailLifetimeHours },
            { label: "Optimized Route", co2: optimized.co2Kg, risk: optimized.summary.contrailProbability, ef: optimized.summary.totalEnergyForcingJ, tag: "Proposed", maxAge: optimized.summary.maxContrailLifetimeHours },
          ].map((row) => (
            <div key={row.label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-white">{row.label}</p>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/50">{row.tag}</span>
              </div>
              <div className="space-y-1.5 text-xs text-white/60">
                <div className="flex justify-between"><span>CO₂</span><span className="font-mono text-white">{Math.round(row.co2)} kg/pax</span></div>
                <div className="flex justify-between"><span>Contrail risk</span>
                  <span className={`font-semibold ${row.risk > 0.5 ? "text-red-400" : row.risk > 0.25 ? "text-amber-400" : "text-emerald-400"}`}>
                    {row.risk > 0.5 ? "High" : row.risk > 0.25 ? "Med" : "Low"} ({(row.risk * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="flex justify-between"><span>Energy forcing</span><span className="font-mono text-white">{(row.ef / 1e9).toFixed(1)} GJ</span></div>
                <div className="flex justify-between"><span>Max contrail age</span><span className="font-mono text-white">{row.maxAge.toFixed(1)} hr</span></div>
              </div>
            </div>
          ))}
        </div>

        {/* Flight altitude profile */}
        <FlightProfileChart result={result} origin={origin} destination={destination} />

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
            <p className="text-lg font-bold text-amber-300">{result.fuelPenaltyPercent.toFixed(1)}%</p>
            <p className="text-[10px] text-white/40">fuel penalty</p>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
            <p className="text-lg font-bold text-emerald-400">{result.efReductionPercent.toFixed(0)}%</p>
            <p className="text-[10px] text-white/40">EF reduction</p>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
            <p className="text-lg font-bold text-white">{result.altitudeAdjustments.length}</p>
            <p className="text-[10px] text-white/40">adjustments</p>
          </div>
        </div>

        <p className="mt-4 text-[10px] text-white/20 text-center">
          Computed via CoCiP / SAC fallback · ERA5 weather · GWP-star for contrail equivalence
        </p>
      </motion.div>
    </motion.div>
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

function QuickFlightCard({ flight, isSelected, onSelect }: { flight: QuickFlight; isSelected: boolean; onSelect: (f: QuickFlight) => void }) {
  const logo = AIRLINE_LOGOS[flight.airline];
  return (
    <button
      onClick={() => onSelect(flight)}
      className={`group flex shrink-0 flex-col gap-3 rounded-2xl border p-4 backdrop-blur-2xl transition-all hover:shadow-lg hover:shadow-black/20 ${
        isSelected
          ? "border-emerald-500/40 bg-emerald-500/[0.08] shadow-md shadow-emerald-500/10"
          : "border-white/[0.08] bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08]"
      }`}
      style={{ minWidth: 200 }}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-[10px] font-bold text-white shadow-sm ${logo?.color ?? "bg-white/20"}`}>
          {flight.airline.slice(0, 2)}
        </div>
        <div className="text-left">
          <p className={`text-sm font-semibold transition-colors ${isSelected ? "text-emerald-400" : "text-white group-hover:text-emerald-400"}`}>{flight.callsign}</p>
          <p className="text-[10px] text-white/40">{logo?.name ?? flight.airline}</p>
        </div>
        {isSelected && (
          <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
            <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-left">
        <div>
          <p className="text-xs font-medium text-white/70">{flight.origin} &rarr; {flight.destination}</p>
          <p className="text-[10px] text-white/30">{flight.date}</p>
        </div>
        <svg className="h-4 w-4 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </div>
    </button>
  );
}

/* ===== Constants ===== */

const CITY_NAMES: Record<string, string> = {
  JFK: "New York, NY", LHR: "London, UK", LAX: "Los Angeles, CA",
  SFO: "San Francisco, CA", ORD: "Chicago, IL", ATL: "Atlanta, GA",
  BOS: "Boston, MA", DFW: "Dallas, TX", MIA: "Miami, FL", SEA: "Seattle, WA",
  DEN: "Denver, CO", CDG: "Paris, France", AMS: "Amsterdam, NL",
  FRA: "Frankfurt, DE", DUB: "Dublin, IE", MAD: "Madrid, ES",
  ZRH: "Zurich, CH", NRT: "Tokyo, JP", SIN: "Singapore", DXB: "Dubai, UAE",
  MAN: "Manchester, UK", FCO: "Rome, IT", BCN: "Barcelona, ES", LIS: "Lisbon, PT",
};

const ICAO_TO_IATA_SHORT: Record<string, string> = {
  KJFK: "JFK", EGLL: "LHR", KLAX: "LAX", KSFO: "SFO", KORD: "ORD",
  KATL: "ATL", KBOS: "BOS", KDFW: "DFW", KMIA: "MIA", KSEA: "SEA",
  KDEN: "DEN", LFPG: "CDG", EHAM: "AMS", EDDF: "FRA", EIDW: "DUB",
  LEMD: "MAD", LSZH: "ZRH", RJTT: "NRT", WSSS: "SIN", OMDB: "DXB",
  EGCC: "MAN", LIRF: "FCO", LEBL: "BCN", LPPT: "LIS",
};

function buildFallbackFlights(): QuickFlight[] {
  const today = new Date();
  const dateRaw = today.toISOString().split("T")[0];
  const date = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return [
    { callsign: "DAL44",  airline: "DAL", origin: "JFK", destination: "DUB", date, dateRaw },
    { callsign: "KLM644", airline: "KLM", origin: "JFK", destination: "AMS", date, dateRaw },
    { callsign: "BAW172", airline: "BAW", origin: "JFK", destination: "LHR", date, dateRaw },
    { callsign: "VIR154", airline: "VIR", origin: "JFK", destination: "LHR", date, dateRaw },
    { callsign: "DAL126", airline: "DAL", origin: "JFK", destination: "MAD", date, dateRaw },
    { callsign: "DAL52",  airline: "DAL", origin: "JFK", destination: "ZRH", date, dateRaw },
  ];
}

const FALLBACK_FLIGHTS: QuickFlight[] = buildFallbackFlights();

function formatDateShort(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}
