"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import type { AirlineScore } from "@/lib/types/airline";
import { GRADE_STYLES, type Grade } from "@/lib/utils/grades";
import {
  CATEGORY_ORDER,
  CATEGORY_META,
} from "@/lib/utils/airline-categories";
import { categoryGradientBar } from "@/lib/utils/grades";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

function getTierColor(tier: string): string {
  switch (tier) {
    case "Sky Saints": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "Clean Cruisers": return "bg-sky-500/15 text-sky-400 border-sky-500/30";
    case "Middle of the Pack": return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "Greenwash Gold Medalists": return "bg-orange-500/15 text-orange-400 border-orange-500/30";
    case "Contrail Criminals": return "bg-red-500/15 text-red-400 border-red-500/30";
    default: return "bg-white/10 text-white/60 border-white/10";
  }
}

export default function AirlineDetailPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? "").toUpperCase();
  const [airline, setAirline] = useState<AirlineScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    fetch("/api/score-airline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ airlineCode: code }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? "Failed to load");
        return r.json();
      })
      .then(setAirline)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="relative -mt-14 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error || !airline) {
    return (
      <div className="relative -mt-14 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="text-white/50">{error ?? "Airline not found"}</p>
          <Link href="/airlines" className="text-sm text-emerald-400 hover:underline">
            Back to rankings
          </Link>
        </div>
      </div>
    );
  }

  const style = GRADE_STYLES[airline.overallGrade as Grade];
  const hasContrailProgram = airline.categories.contrailMitigation >= 50;

  return (
    <div className="relative -mt-14 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <motion.div
        className="relative z-10 mx-auto max-w-4xl space-y-6 px-4 pb-16 pt-24 sm:px-8"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Back link */}
        <motion.div variants={fadeUp}>
          <Link href="/airlines" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to rankings
          </Link>
        </motion.div>

        {/* Hero card */}
        <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${style.bg} text-4xl font-bold text-white shadow-lg ${style.glow} shadow-xl`}>
              {airline.overallGrade}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-white">{airline.airlineName}</h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs text-white/60">{airline.airlineCode}</span>
                <span className={`rounded-full border px-3 py-0.5 text-xs font-medium ${getTierColor(airline.tier)}`}>
                  {airline.tier}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-center gap-6 sm:justify-start">
                <div>
                  <span className="text-4xl font-bold text-white">{airline.overallScore}</span>
                  <span className="text-sm text-white/40">/100</span>
                </div>
                <div className="text-sm text-white/50">
                  <p>Fleet: {airline.fleetProfile.totalAircraft} aircraft</p>
                  <p>Avg age: {airline.fleetProfile.averageAge} years</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category breakdown */}
        <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="mb-5 text-lg font-semibold text-white">Scoring Breakdown</h2>
          <div className="space-y-4">
            {CATEGORY_ORDER.map((key) => {
              const meta = CATEGORY_META[key];
              const value = airline.categories[key];
              return (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{meta.icon}</span>
                      <span className="text-sm font-medium text-white">{meta.label}</span>
                      <span className="text-[10px] text-white/30">{meta.weight}%</span>
                    </div>
                    <span className="text-sm font-bold text-white">{value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className={`h-full rounded-full ${categoryGradientBar(value)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                    />
                  </div>
                  <p className="mt-0.5 text-[11px] text-white/30">{meta.description}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Fleet composition */}
        <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="mb-4 text-lg font-semibold text-white">Fleet Composition</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {airline.fleetProfile.aircraftTypes.map((ac) => (
              <div key={ac.type} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">{ac.type}</p>
                  <p className="text-xs text-white/40">{ac.count} aircraft</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${ac.fuelEfficiency <= 2.6 ? "text-emerald-400" : ac.fuelEfficiency <= 3.0 ? "text-amber-400" : "text-red-400"}`}>
                    {ac.fuelEfficiency.toFixed(1)}
                  </p>
                  <p className="text-[10px] text-white/30">L/100pax-km</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Key highlights */}
        <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="mb-4 text-lg font-semibold text-white">Key Highlights</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/5 bg-white/5 p-4 text-center">
              <p className="text-xs text-white/40">Contrail Program</p>
              <p className={`mt-1 text-lg font-bold ${hasContrailProgram ? "text-emerald-400" : "text-red-400"}`}>
                {hasContrailProgram ? "Active" : "None"}
              </p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-4 text-center">
              <p className="text-xs text-white/40">SAF Adoption</p>
              <p className="mt-1 text-lg font-bold text-white">{(airline.categories.sustainableFuel / 20).toFixed(1)}%</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-4 text-center">
              <p className="text-xs text-white/40">Fleet Age</p>
              <p className={`mt-1 text-lg font-bold ${airline.fleetProfile.averageAge < 10 ? "text-emerald-400" : airline.fleetProfile.averageAge < 13 ? "text-amber-400" : "text-red-400"}`}>
                {airline.fleetProfile.averageAge}y
              </p>
            </div>
          </div>
        </motion.div>

        {/* Narrative */}
        {airline.narrative && (
          <motion.div variants={fadeUp} className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6 backdrop-blur-xl">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500">
                <span className="text-sm font-bold text-white">K2</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">AI Analysis</p>
                <p className="mt-1 text-sm leading-relaxed text-white/60">{airline.narrative}</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div variants={fadeUp} className="flex justify-center">
          <Link href="/airlines" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to All Rankings
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
