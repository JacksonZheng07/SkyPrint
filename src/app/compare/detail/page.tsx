"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ContrailBlocks } from "@/components/compare/contrail-blocks";
import type { FlightComparisonItem, FlightComparison } from "@/lib/types/comparison";
import { formatDuration, formatContrailRisk } from "@/lib/utils/format";
import { useAero } from "@/hooks/use-aero";

const FUEL_KG_TO_LITERS = 0.32;
const CO2_PER_TREE_KG = 21;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

export default function CompareDetailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CompareDetailContent />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="relative -mt-14 min-h-screen bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/BuyTicket.png')" }}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
      </div>
    </div>
  );
}

function CompareDetailContent() {
  const searchParams = useSearchParams();
  const idA = searchParams.get("a");
  const idB = searchParams.get("b");
  const [flightA, setFlightA] = useState<FlightComparisonItem | null>(null);
  const [flightB, setFlightB] = useState<FlightComparisonItem | null>(null);
  const { setPageContext } = useAero();

  useEffect(() => {
    const raw = sessionStorage.getItem("skyprint_comparison");
    if (!raw || !idA || !idB) return;
    try {
      const data = JSON.parse(raw) as FlightComparison;
      const a = data.flights.find((f) => f.flight.flightId === idA) ?? null;
      const b = data.flights.find((f) => f.flight.flightId === idB) ?? null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFlightA(a);
      setFlightB(b);
    } catch {
      // invalid session data
    }
  }, [idA, idB]);

  // Cache comparison context into Gemini so Aero can answer questions
  useEffect(() => {
    if (!flightA || !flightB) return;
    const better = flightA.totalImpactScore <= flightB.totalImpactScore ? flightA : flightB;
    setPageContext({
      page: "compare-detail",
      flightA: {
        airline: flightA.flight.airline,
        flightNumber: flightA.flight.flightNumber,
        aircraftType: flightA.flight.aircraftType,
        co2Kg: flightA.contrail.co2Kg,
        contrailRisk: flightA.metrics.riskRating,
        contrailImpactScore: flightA.metrics.impactScore,
        totalImpactScore: flightA.totalImpactScore,
        price: flightA.flight.price,
        duration: flightA.flight.duration,
        stops: flightA.flight.stops,
      },
      flightB: {
        airline: flightB.flight.airline,
        flightNumber: flightB.flight.flightNumber,
        aircraftType: flightB.flight.aircraftType,
        co2Kg: flightB.contrail.co2Kg,
        contrailRisk: flightB.metrics.riskRating,
        contrailImpactScore: flightB.metrics.impactScore,
        totalImpactScore: flightB.totalImpactScore,
        price: flightB.flight.price,
        duration: flightB.flight.duration,
        stops: flightB.flight.stops,
      },
      betterChoice: better.flight.airline,
      co2DeltaKg: Math.abs(flightA.contrail.co2Kg - flightB.contrail.co2Kg),
      airlineEcoA: AIRLINE_ECO_DATA[flightA.flight.airlineCode]?.tier ?? "Unranked",
      airlineEcoB: AIRLINE_ECO_DATA[flightB.flight.airlineCode]?.tier ?? "Unranked",
    });
  }, [flightA, flightB, setPageContext]);

  if (!flightA || !flightB) return <MissingData />;

  const better = flightA.totalImpactScore <= flightB.totalImpactScore ? "a" : "b";
  const betterItem = better === "a" ? flightA : flightB;
  const worseItem = better === "a" ? flightB : flightA;
  const co2Delta = Math.abs(flightA.contrail.co2Kg - flightB.contrail.co2Kg);
  const treesEquiv = Math.round(co2Delta / CO2_PER_TREE_KG);

  return (
    <div className="relative -mt-14 min-h-screen bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/BuyTicket.png')" }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      <motion.div
        className="relative z-10 mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-24 sm:px-8"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Back + header */}
        <motion.div variants={fadeUp}>
          <Link href="/compare" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to results
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-white">Flight Comparison</h1>
          <p className="mt-1 text-sm text-white/50">
            CO₂ difference: <span className="font-semibold text-emerald-400">{Math.round(co2Delta)} kg</span> — equivalent to {treesEquiv} tree{treesEquiv !== 1 ? "s" : ""}/year
          </p>
        </motion.div>

        {/* Two flight headers side by side */}
        <motion.div variants={fadeUp} className="grid gap-4 md:grid-cols-2">
          <FlightCard item={flightA} isBetter={better === "a"} />
          <FlightCard item={flightB} isBetter={better === "b"} />
        </motion.div>

        {/* Contrail impact — shown as percentage */}
        <motion.div variants={fadeUp} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="mb-2 text-center text-lg font-semibold text-white">Contrail Climate Impact</h2>
          <p className="mb-6 text-center text-xs text-white/40">Contrails cause up to 57% of aviation&apos;s warming effect. Higher % = more warming.</p>
          <div className="grid grid-cols-2 gap-8">
            <ContrailImpactGauge item={flightA} isBetter={better === "a"} />
            <ContrailImpactGauge item={flightB} isBetter={better === "b"} />
          </div>
        </motion.div>

        {/* Carbon cost analysis */}
        {flightA.flight.price && flightB.flight.price && co2Delta > 0 && (
          <motion.div variants={fadeUp} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="mb-2 text-center text-lg font-semibold text-white">Carbon Cost Analysis</h2>
            <p className="mb-5 text-center text-xs text-white/40">How much does it cost per kg of CO₂ saved by choosing the greener flight?</p>
            <CarbonCostBreakdown flightA={flightA} flightB={flightB} />
          </motion.div>
        )}

        {/* Airline eco reputation */}
        <motion.div variants={fadeUp} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="mb-5 text-lg font-semibold text-white">Airline Environmental Reputation</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <AirlineReputationCard code={flightA.flight.airlineCode} name={flightA.flight.airline || flightA.flight.airlineCode} />
            <AirlineReputationCard code={flightB.flight.airlineCode} name={flightB.flight.airline || flightB.flight.airlineCode} />
          </div>
        </motion.div>

        {/* Carbon emission breakdown */}
        <motion.div variants={fadeUp} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="mb-5 text-lg font-semibold text-white">Carbon Emission Breakdown</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <EmissionBreakdown item={flightA} other={flightB} />
            <EmissionBreakdown item={flightB} other={flightA} />
          </div>
        </motion.div>

        {/* Contrail analysis */}
        <motion.div variants={fadeUp} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="mb-5 text-lg font-semibold text-white">Contrail Risk Analysis</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <ContrailBreakdown item={flightA} />
            <ContrailBreakdown item={flightB} />
          </div>
        </motion.div>

        {/* Flight factors comparison */}
        <motion.div variants={fadeUp} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="mb-5 text-lg font-semibold text-white">Flight Factors</h2>
          <div className="space-y-3">
            {flightA.flight.price && flightB.flight.price && (
              <CompareRow label="Price" a={`$${flightA.flight.price}`} b={`$${flightB.flight.price}`} />
            )}
            <CompareRow label="Departure" a={formatTime(flightA.flight.departureTime)} b={formatTime(flightB.flight.departureTime)} />
            <CompareRow label="Arrival" a={formatTime(flightA.flight.arrivalTime)} b={formatTime(flightB.flight.arrivalTime)} />
            <CompareRow label="Flight Time" a={formatDuration(flightA.flight.duration)} b={formatDuration(flightB.flight.duration)} />
            <CompareRow label="Aircraft" a={flightA.flight.aircraftType} b={flightB.flight.aircraftType} />
            <CompareRow label="Stops" a={flightA.flight.stops === 0 ? "Direct" : `${flightA.flight.stops} stop`} b={flightB.flight.stops === 0 ? "Direct" : `${flightB.flight.stops} stop`} />
            <CompareRow label="Carrier" a={flightA.flight.airlineCode} b={flightB.flight.airlineCode} />
            <CompareRow label="Fuel Burn" a={`${(flightA.contrail.co2Kg * FUEL_KG_TO_LITERS).toFixed(0)} L`} b={`${(flightB.contrail.co2Kg * FUEL_KG_TO_LITERS).toFixed(0)} L`} />
            <CompareRow label="CO₂ per pax" a={`${Math.round(flightA.contrail.co2Kg)} kg`} b={`${Math.round(flightB.contrail.co2Kg)} kg`} />
            <CompareRow
              label="Time-of-day Risk"
              a={getTimeOfDayRisk(flightA.flight.departureTime)}
              b={getTimeOfDayRisk(flightB.flight.departureTime)}
            />
            <CompareRow
              label="Contrail Impact"
              a={`${Math.min(100, flightA.metrics.impactScore)}%`}
              b={`${Math.min(100, flightB.metrics.impactScore)}%`}
            />
            <CompareRow
              label="Eco Grade"
              a={AIRLINE_ECO_DATA[flightA.flight.airlineCode]?.grade ?? "C"}
              b={AIRLINE_ECO_DATA[flightB.flight.airlineCode]?.grade ?? "C"}
            />
          </div>
        </motion.div>

        {/* K2 Climate Intelligence */}
        {(flightA.impactCopy || flightB.impactCopy) && (
          <motion.div variants={fadeUp} className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 backdrop-blur-xl">
            <h2 className="mb-4 text-lg font-semibold text-white">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded bg-emerald-600 text-[10px] font-bold text-white">K2</span>
              Climate Intelligence
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {flightA.impactCopy && (
                <div className="rounded-lg border border-white/5 bg-white/5 p-4">
                  <p className="mb-2 text-xs font-medium text-white/60">{flightA.flight.airline}</p>
                  <p className="text-sm leading-relaxed text-white/70">{flightA.impactCopy}</p>
                </div>
              )}
              {flightB.impactCopy && (
                <div className="rounded-lg border border-white/5 bg-white/5 p-4">
                  <p className="mb-2 text-xs font-medium text-white/60">{flightB.flight.airline}</p>
                  <p className="text-sm leading-relaxed text-white/70">{flightB.impactCopy}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Aero summary */}
        <motion.div variants={fadeUp} className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-6 backdrop-blur-xl">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Aero&apos;s take</p>
              <p className="mt-1 text-sm leading-relaxed text-white/60">
                {betterItem.flight.airline} is the better climate choice here — it produces{" "}
                <span className="font-medium text-emerald-400">{Math.round(co2Delta)} kg less CO₂</span> and
                has {betterItem.metrics.riskRating === "low" ? "minimal" : "lower"} contrail risk.
                {worseItem.metrics.riskRating === "high" && ` ${worseItem.flight.airline} flies through conditions that are highly likely to form persistent, warming contrails.`}
                {" "}The {Math.round(co2Delta)} kg difference is roughly what {treesEquiv} tree{treesEquiv !== 1 ? "s" : ""} absorb{treesEquiv === 1 ? "s" : ""} in a year.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Actions — book buttons for both flights */}
        <motion.div variants={fadeUp} className="grid gap-4 md:grid-cols-2">
          <div className={`flex flex-col gap-2 rounded-xl border p-4 backdrop-blur-xl ${better === "a" ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/10 bg-white/5"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{flightA.flight.airline}</p>
                <p className="text-xs text-white/40">{flightA.flight.flightNumber}</p>
              </div>
              {flightA.flight.price && <p className="text-lg font-bold text-white">${flightA.flight.price}</p>}
            </div>
            <button className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors ${better === "a" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-white/10 hover:bg-white/15"}`}>
              Book {flightA.flight.airlineCode} {better === "a" ? "— Better Choice" : ""}
            </button>
          </div>
          <div className={`flex flex-col gap-2 rounded-xl border p-4 backdrop-blur-xl ${better === "b" ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/10 bg-white/5"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{flightB.flight.airline}</p>
                <p className="text-xs text-white/40">{flightB.flight.flightNumber}</p>
              </div>
              {flightB.flight.price && <p className="text-lg font-bold text-white">${flightB.flight.price}</p>}
            </div>
            <button className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors ${better === "b" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-white/10 hover:bg-white/15"}`}>
              Book {flightB.flight.airlineCode} {better === "b" ? "— Better Choice" : ""}
            </button>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="flex justify-center">
          <Link href="/compare" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to All Flights
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ===== Sub-components ===== */

function ContrailImpactGauge({ item, isBetter }: { item: FlightComparisonItem; isBetter: boolean }) {
  const prob = Math.round(item.contrail.summary.contrailProbability * 100);
  const impactPct = Math.min(100, item.metrics.impactScore);
  const color = impactPct < 25 ? "emerald" : impactPct < 60 ? "amber" : "red";
  const colorClasses = {
    emerald: { text: "text-emerald-400", bg: "bg-emerald-500", ring: "stroke-emerald-400" },
    amber: { text: "text-amber-400", bg: "bg-amber-500", ring: "stroke-amber-400" },
    red: { text: "text-red-400", bg: "bg-red-500", ring: "stroke-red-400" },
  }[color];

  const dim = 100;
  const strokeWidth = 5;
  const radius = (dim - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle cx={dim / 2} cy={dim / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-white/10" />
          <motion.circle
            cx={dim / 2} cy={dim / 2} r={radius} fill="none"
            strokeWidth={strokeWidth} strokeLinecap="round"
            className={colorClasses.ring}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - impactPct / 100) }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold leading-none ${colorClasses.text}`}>{impactPct}%</span>
          <span className="text-[10px] text-white/40">impact</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-white">{item.flight.airline}</p>
        <p className="text-[11px] text-white/40">{prob}% contrail formation probability</p>
      </div>
      {isBetter && <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-[10px] font-semibold text-emerald-400">Better Choice</span>}
    </div>
  );
}

function FlightCard({ item, isBetter }: { item: FlightComparisonItem; isBetter: boolean }) {
  const { flight, metrics } = item;
  const risk = formatContrailRisk(metrics.riskRating);
  return (
    <div className={`rounded-xl border p-5 backdrop-blur-xl ${isBetter ? "border-emerald-500/40 bg-emerald-500/10" : "border-white/10 bg-white/5"}`}>
      {isBetter && <span className="mb-2 inline-block rounded-full bg-emerald-500/20 px-3 py-0.5 text-[10px] font-semibold text-emerald-400">Better Climate Choice</span>}
      <div className="flex items-center gap-3">
        <div>
          <p className="font-semibold text-white">{flight.airline || flight.airlineCode}</p>
          <p className="text-xs text-white/40">{flight.airlineCode} {flight.flightNumber} &middot; {flight.aircraftType}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 text-sm text-white/70">
        <span className="font-medium text-white">{formatTime(flight.departureTime)}</span>
        <span className="text-white/30">&rarr;</span>
        <span className="font-medium text-white">{formatTime(flight.arrivalTime)}</span>
        <span className="text-xs text-white/40">{formatDuration(flight.duration)}</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
          metrics.riskRating === "low" ? "bg-emerald-500/15 text-emerald-400"
          : metrics.riskRating === "medium" ? "bg-amber-500/15 text-amber-400"
          : "bg-red-500/15 text-red-400"
        }`}>{risk.label}</span>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-white/50">{Math.round(item.contrail.co2Kg)} kg CO₂</span>
        {flight.price && (
          <span className="ml-auto text-lg font-bold text-white">${flight.price}</span>
        )}
      </div>
    </div>
  );
}

function EmissionBreakdown({ item, other }: { item: FlightComparisonItem; other: FlightComparisonItem }) {
  const co2 = item.contrail.co2Kg;
  const fuelBurn = co2 * FUEL_KG_TO_LITERS;
  const rfForcing = item.contrail.summary.meanRfNetWM2;
  const contrailScore = item.metrics.impactScore;

  // Breakdown: fuel combustion CO₂, contrail radiative forcing, time-of-day factor
  const depHour = new Date(item.flight.departureTime).getUTCHours();
  const isNightFlight = depHour >= 18 || depHour < 6;
  const isMorningFlight = depHour >= 6 && depHour < 10;
  const timeOfDayRisk = isNightFlight ? "High" : isMorningFlight ? "Medium" : "Low";
  const timeOfDayColor = isNightFlight ? "text-red-400" : isMorningFlight ? "text-amber-400" : "text-emerald-400";

  // Aircraft efficiency
  const efficientTypes = ["B789", "A359", "A35K", "A321"];
  const isEfficient = efficientTypes.includes(item.flight.aircraftType);

  const isBetter = co2 <= other.contrail.co2Kg;

  return (
    <div className="space-y-3 rounded-lg border border-white/5 bg-white/5 p-4">
      <p className="text-sm font-medium text-white">{item.flight.airline}</p>

      {/* Direct CO₂ */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">Direct CO₂ (fuel burn)</span>
        <span className={`text-sm font-bold ${isBetter ? "text-emerald-400" : "text-red-400"}`}>{Math.round(co2)} kg</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${isBetter ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${Math.min(100, (co2 / Math.max(co2, other.contrail.co2Kg)) * 100)}%` }} />
      </div>

      {/* Fuel burn */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">Fuel burn</span>
        <span className="text-xs font-medium text-white/70">{fuelBurn.toFixed(0)} L jet fuel</span>
      </div>

      {/* Contrail warming */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">Contrail radiative forcing</span>
        <span className="text-xs font-medium text-white/70">{(rfForcing * 1000).toFixed(2)} mW/m²</span>
      </div>

      {/* Contrail impact score */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">Contrail impact</span>
        <span className={`text-xs font-bold ${contrailScore < 25 ? "text-emerald-400" : contrailScore < 60 ? "text-amber-400" : "text-red-400"}`}>{Math.min(100, contrailScore)}%</span>
      </div>

      {/* Time-of-day */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">Time-of-day contrail risk</span>
        <span className={`text-xs font-medium ${timeOfDayColor}`}>
          {timeOfDayRisk} ({depHour}:00 UTC dep.)
        </span>
      </div>

      {/* Aircraft efficiency */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">Aircraft efficiency</span>
        <span className={`text-xs font-medium ${isEfficient ? "text-emerald-400" : "text-amber-400"}`}>
          {item.flight.aircraftType} — {isEfficient ? "High" : "Standard"}
        </span>
      </div>

      {/* Tree equivalent */}
      <div className="mt-1 rounded-md bg-white/5 px-3 py-2 text-center text-xs text-white/50">
        {Math.round(co2)} kg CO₂ &asymp; {Math.round(co2 / CO2_PER_TREE_KG)} trees/year
      </div>
    </div>
  );
}

function ContrailBreakdown({ item }: { item: FlightComparisonItem }) {
  const { metrics, contrail } = item;
  const risk = formatContrailRisk(metrics.riskRating);
  const persistentWaypoints = contrail.waypointResults.filter((w) => w.persistent).length;
  const totalWaypoints = contrail.waypointResults.length;

  return (
    <div className="flex flex-col items-center gap-4">
      <ContrailBlocks score={metrics.impactScore} size="md" />
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
        metrics.riskRating === "low" ? "bg-emerald-500/15 text-emerald-400"
        : metrics.riskRating === "medium" ? "bg-amber-500/15 text-amber-400"
        : "bg-red-500/15 text-red-400"
      }`}>{risk.label}</span>
      <div className="w-full space-y-2 text-xs">
        <div className="flex justify-between text-white/40">
          <span>Formation probability</span>
          <span className="text-white/70">{Math.round(contrail.summary.contrailProbability * 100)}%</span>
        </div>
        <div className="flex justify-between text-white/40">
          <span>Persistent contrail waypoints</span>
          <span className="text-white/70">{persistentWaypoints}/{totalWaypoints}</span>
        </div>
        <div className="flex justify-between text-white/40">
          <span>Max contrail lifetime</span>
          <span className="text-white/70">{contrail.summary.maxContrailLifetimeHours > 0 ? `${contrail.summary.maxContrailLifetimeHours.toFixed(1)}h` : "N/A"}</span>
        </div>
        <div className="flex justify-between text-white/40">
          <span>Energy forcing</span>
          <span className="text-white/70">{(contrail.summary.totalEnergyForcingJ / 1e9).toFixed(2)} GJ</span>
        </div>
      </div>
    </div>
  );
}

function CompareRow({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
      <p className="text-right text-sm font-medium text-white">{a}</p>
      <p className="min-w-[120px] text-center text-xs text-white/40">{label}</p>
      <p className="text-sm font-medium text-white">{b}</p>
    </div>
  );
}

function MissingData() {
  return (
    <div className="relative -mt-14 min-h-screen bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/BuyTicket.png')" }}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-28 text-center">
        <p className="text-white/50">Select two flights to compare them side by side.</p>
        <Link href="/compare" className="mt-4 inline-block text-sm text-emerald-400 hover:underline">
          &larr; Back to search
        </Link>
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  if (!iso) return "--:--";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getTimeOfDayRisk(iso: string): string {
  if (!iso) return "Unknown";
  const h = new Date(iso).getUTCHours();
  if (h >= 18 || h < 6) return "High (night)";
  if (h >= 6 && h < 10) return "Medium (morning)";
  return "Low (daytime)";
}

/* ===== Airline Reputation ===== */

interface AirlineEcoData {
  grade: string;
  gradeColor: string;
  tier: string;
  contrailProgram: boolean;
  safAdoption: number; // % of fuel
  fleetEfficiency: string;
  emissionsTrend: "improving" | "flat" | "worsening";
  commitments: string;
}

const AIRLINE_ECO_DATA: Record<string, AirlineEcoData> = {
  AS: { grade: "A", gradeColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30", tier: "Sky Saints", contrailProgram: true, safAdoption: 8.2, fleetEfficiency: "High", emissionsTrend: "improving", commitments: "Net zero by 2040, active contrail avoidance trials" },
  DL: { grade: "A-", gradeColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30", tier: "Sky Saints", contrailProgram: true, safAdoption: 5.1, fleetEfficiency: "High", emissionsTrend: "improving", commitments: "Net zero by 2050, SAF investment leader" },
  NH: { grade: "A-", gradeColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30", tier: "Sky Saints", contrailProgram: true, safAdoption: 4.8, fleetEfficiency: "High", emissionsTrend: "improving", commitments: "Carbon neutral by 2050, fleet modernization" },
  UA: { grade: "B+", gradeColor: "text-sky-400 bg-sky-500/15 border-sky-500/30", tier: "Clean Cruisers", contrailProgram: false, safAdoption: 3.4, fleetEfficiency: "Above Avg", emissionsTrend: "improving", commitments: "100% green by 2050, largest SAF purchase agreement" },
  BA: { grade: "B+", gradeColor: "text-sky-400 bg-sky-500/15 border-sky-500/30", tier: "Clean Cruisers", contrailProgram: false, safAdoption: 2.8, fleetEfficiency: "Above Avg", emissionsTrend: "flat", commitments: "Net zero by 2050, fleet renewal underway" },
  VS: { grade: "B", gradeColor: "text-sky-400 bg-sky-500/15 border-sky-500/30", tier: "Clean Cruisers", contrailProgram: false, safAdoption: 2.2, fleetEfficiency: "Above Avg", emissionsTrend: "flat", commitments: "Net zero by 2050, SAF pioneer" },
  B6: { grade: "B", gradeColor: "text-sky-400 bg-sky-500/15 border-sky-500/30", tier: "Clean Cruisers", contrailProgram: false, safAdoption: 1.9, fleetEfficiency: "Average", emissionsTrend: "flat", commitments: "Carbon neutral domestic by 2040" },
  AA: { grade: "C+", gradeColor: "text-amber-400 bg-amber-500/15 border-amber-500/30", tier: "Middle of the Pack", contrailProgram: false, safAdoption: 1.2, fleetEfficiency: "Average", emissionsTrend: "flat", commitments: "Net zero by 2050, limited concrete action" },
  WN: { grade: "C", gradeColor: "text-amber-400 bg-amber-500/15 border-amber-500/30", tier: "Middle of the Pack", contrailProgram: false, safAdoption: 0.8, fleetEfficiency: "Below Avg", emissionsTrend: "flat", commitments: "Efficiency improvements, no net zero target" },
  NK: { grade: "D+", gradeColor: "text-orange-400 bg-orange-500/15 border-orange-500/30", tier: "Contrail Criminals", contrailProgram: false, safAdoption: 0.1, fleetEfficiency: "Below Avg", emissionsTrend: "worsening", commitments: "No published environmental plan" },
};

const DEFAULT_ECO: AirlineEcoData = { grade: "C", gradeColor: "text-amber-400 bg-amber-500/15 border-amber-500/30", tier: "Unranked", contrailProgram: false, safAdoption: 0.5, fleetEfficiency: "Unknown", emissionsTrend: "flat", commitments: "No public data available" };

function CarbonCostBreakdown({ flightA, flightB }: { flightA: FlightComparisonItem; flightB: FlightComparisonItem }) {
  const co2A = flightA.contrail.co2Kg;
  const co2B = flightB.contrail.co2Kg;
  const priceA = flightA.flight.price ?? 0;
  const priceB = flightB.flight.price ?? 0;
  const co2Delta = Math.abs(co2A - co2B);
  const priceDelta = Math.abs(priceA - priceB);
  const costPerKg = co2Delta > 0 ? priceDelta / co2Delta : 0;
  const carbonMarketRef = 0.05; // ~$50/tonne = $0.05/kg (EU ETS)
  const isGoodDeal = costPerKg <= carbonMarketRef * 3; // within 3x of market

  const cheaperAndGreener =
    (co2A <= co2B && priceA <= priceB) || (co2B <= co2A && priceB <= priceA);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border border-white/5 bg-white/5 p-4 text-center">
        <p className="text-xs text-white/40">Price difference</p>
        <p className="mt-1 text-2xl font-bold text-white">${priceDelta.toFixed(0)}</p>
      </div>
      <div className="rounded-lg border border-white/5 bg-white/5 p-4 text-center">
        <p className="text-xs text-white/40">CO₂ difference</p>
        <p className="mt-1 text-2xl font-bold text-emerald-400">{Math.round(co2Delta)} kg</p>
      </div>
      <div className="rounded-lg border border-white/5 bg-white/5 p-4 text-center">
        <p className="text-xs text-white/40">Cost per kg CO₂ saved</p>
        <p className={`mt-1 text-2xl font-bold ${cheaperAndGreener ? "text-emerald-400" : isGoodDeal ? "text-amber-400" : "text-red-400"}`}>
          {cheaperAndGreener ? "Free!" : `$${costPerKg.toFixed(2)}`}
        </p>
        <p className="mt-1 text-[10px] text-white/30">
          EU carbon market: ~${carbonMarketRef.toFixed(2)}/kg
        </p>
      </div>
    </div>
  );
}

function AirlineReputationCard({ code, name }: { code: string; name: string }) {
  const eco = AIRLINE_ECO_DATA[code] ?? DEFAULT_ECO;
  const trendIcon = eco.emissionsTrend === "improving" ? "↓" : eco.emissionsTrend === "worsening" ? "↑" : "→";
  const trendColor = eco.emissionsTrend === "improving" ? "text-emerald-400" : eco.emissionsTrend === "worsening" ? "text-red-400" : "text-amber-400";

  return (
    <div className="space-y-3 rounded-lg border border-white/5 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border text-lg font-bold ${eco.gradeColor}`}>
          {eco.grade}
        </span>
        <div>
          <p className="text-sm font-medium text-white">{name}</p>
          <p className="text-[11px] text-white/40">{eco.tier}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40">Contrail avoidance program</span>
          <span className={`text-xs font-medium ${eco.contrailProgram ? "text-emerald-400" : "text-red-400"}`}>
            {eco.contrailProgram ? "Active" : "None"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40">SAF adoption</span>
          <span className="text-xs font-medium text-white/70">{eco.safAdoption}% of fuel</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40">Fleet efficiency</span>
          <span className="text-xs font-medium text-white/70">{eco.fleetEfficiency}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40">Emissions trend (YoY)</span>
          <span className={`text-xs font-medium ${trendColor}`}>
            {trendIcon} {eco.emissionsTrend.charAt(0).toUpperCase() + eco.emissionsTrend.slice(1)}
          </span>
        </div>
      </div>

      <p className="rounded-md bg-white/5 px-3 py-2 text-[11px] leading-relaxed text-white/40">
        {eco.commitments}
      </p>
    </div>
  );
}
