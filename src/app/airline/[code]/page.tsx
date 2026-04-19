"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import type { AirlineScore } from "@/lib/types/airline";
import {
  GRADE_STYLES,
  getTierColor,
  scoreToPlusMinusGrade,
  pmGradeBaseGrade,
  pmGradeLabel,
  percentileLabel,
} from "@/lib/utils/grades";
import {
  CATEGORY_ORDER,
  CATEGORY_META,
} from "@/lib/utils/airline-categories";
import { AirlineLogo } from "@/components/compare/airline-logo";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

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
      <div className="relative -mt-14 min-h-screen bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/AirlinePhoto.png')" }}>
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
            <p className="mt-4 text-sm text-white/40">Generating K2 report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !airline) {
    return (
      <div className="relative -mt-14 min-h-screen bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/AirlinePhoto.png')" }}>
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="text-white/50">{error ?? "Airline not found"}</p>
          <Link href="/airlines" className="text-sm text-emerald-400 hover:underline">Back to rankings</Link>
        </div>
      </div>
    );
  }

  const pmGrade = scoreToPlusMinusGrade(airline.overallScore);
  const base = pmGradeBaseGrade(pmGrade);
  const style = GRADE_STYLES[base];
  const hasContrailProgram = airline.categories.contrailMitigation >= 50;
  const report = airline.report;

  return (
    <div className="relative -mt-14 min-h-screen bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/AirlinePhoto.png')" }}>
      <div className="absolute inset-0 bg-black/65" />

      <motion.div
        className="relative z-10 mx-auto max-w-5xl space-y-6 px-4 pb-16 pt-24 sm:px-8"
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
        <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-6">
            <AirlineLogo code={airline.airlineCode} size={72} className="rounded-xl" />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-white">{airline.airlineName}</h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs text-white/60">{airline.airlineCode}</span>
                <span className={`rounded-full border px-3 py-0.5 text-xs font-medium ${getTierColor(airline.tier)}`}>
                  {airline.tier}
                </span>
                <span className="rounded-md bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                  Q2 2025
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className={`flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${style.bg} text-2xl font-black text-white shadow-lg`}>
                  {pmGrade}
                </div>
                <p className={`mt-1.5 text-xs font-semibold ${style.text}`}>{pmGradeLabel(pmGrade)}</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold text-white">{airline.overallScore}</span>
                <span className="text-sm text-white/40">/100</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Two-column: Scoring + Highlights */}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Category breakdown with grade badges */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Scoring Breakdown</h2>
              <span className="text-[10px] text-white/20">Weight</span>
            </div>
            <div className="space-y-3">
              {CATEGORY_ORDER.map((key) => {
                const meta = CATEGORY_META[key];
                const value = airline.categories[key];
                const catGrade = scoreToPlusMinusGrade(value);
                const catBase = pmGradeBaseGrade(catGrade);
                const catStyle = GRADE_STYLES[catBase];

                return (
                  <div key={key} className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-base">{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">{meta.label}</p>
                          <span className="text-[10px] text-white/25">{meta.weight}%</span>
                        </div>
                        <p className="text-[10px] text-white/30">{meta.description}</p>
                      </div>
                      <div className={`flex h-8 w-10 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${catStyle.bg} text-xs font-black text-white`}>
                        {catGrade}
                      </div>
                      <div className="w-[80px] flex-shrink-0 text-right">
                        <p className={`text-sm font-bold ${catStyle.text}`}>{value}</p>
                        <p className="text-[10px] text-white/25">{percentileLabel(value)}</p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${catStyle.bg}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right column: Key stats + Fleet */}
          <div className="space-y-6">
            {/* Key highlights */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <h3 className="mb-4 text-sm font-semibold text-white">Key Metrics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">Contrail Program</span>
                  <span className={`text-xs font-semibold ${hasContrailProgram ? "text-emerald-400" : "text-red-400"}`}>
                    {hasContrailProgram ? "Active" : "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">SAF Adoption</span>
                  <span className="text-xs font-semibold text-white">{airline.safPercent.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">Fleet Size</span>
                  <span className="text-xs font-semibold text-white">{airline.fleetProfile.totalAircraft} aircraft</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">Fleet Age</span>
                  <span className={`text-xs font-semibold ${airline.fleetProfile.averageAge < 10 ? "text-emerald-400" : airline.fleetProfile.averageAge < 13 ? "text-amber-400" : "text-red-400"}`}>
                    {airline.fleetProfile.averageAge} years
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Fleet composition */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <h3 className="mb-4 text-sm font-semibold text-white">Fleet Composition</h3>
              <div className="space-y-2">
                {airline.fleetProfile.aircraftTypes.map((ac) => (
                  <div key={ac.type} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
                    <div>
                      <p className="text-xs font-semibold text-white">{ac.type}</p>
                      <p className="text-[10px] text-white/30">{ac.count} aircraft</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${ac.fuelEfficiency <= 2.6 ? "text-emerald-400" : ac.fuelEfficiency <= 3.0 ? "text-amber-400" : "text-red-400"}`}>
                        {ac.fuelEfficiency.toFixed(1)}
                      </p>
                      <p className="text-[10px] text-white/25">L/100pax-km</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* K2 Climate Intelligence Report — always rendered (local fallback if K2 unavailable) */}
        <motion.div variants={fadeUp} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500">
              <span className="text-[10px] font-bold text-white">K2</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">K2 Climate Intelligence Report</h2>
              <p className="text-[11px] text-white/30">Generated by K2 Think V2 reasoning model</p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6 backdrop-blur-xl">
            <h3 className="mb-2 text-sm font-semibold text-cyan-400">Executive Summary</h3>
            <p className="text-sm leading-relaxed text-white/70">{report.executiveSummary}</p>
          </div>

          {/* Report sections grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-base">☁️</span>
                <h3 className="text-sm font-semibold text-white">Contrail Analysis</h3>
              </div>
              <p className="text-xs leading-relaxed text-white/50">{report.contrailAnalysis}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-base">✈️</span>
                <h3 className="text-sm font-semibold text-white">Fleet Assessment</h3>
              </div>
              <p className="text-xs leading-relaxed text-white/50">{report.fleetAssessment}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-base">🌱</span>
                <h3 className="text-sm font-semibold text-white">SAF Outlook</h3>
              </div>
              <p className="text-xs leading-relaxed text-white/50">{report.safOutlook}</p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <h3 className="mb-3 text-sm font-semibold text-white">Recommendations</h3>
            <div className="space-y-2">
              {report.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                    {i + 1}
                  </span>
                  <p className="text-xs leading-relaxed text-white/60">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Grade justification */}
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${style.bg} text-sm font-black text-white`}>
                {pmGrade}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Grade Justification</h3>
                <p className="text-xs leading-relaxed text-white/50">{report.gradeJustification}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div variants={fadeUp} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5 backdrop-blur-xl">
          <div>
            <p className="text-sm font-semibold text-white">Want to see how {airline.airlineName} compares?</p>
            <p className="text-xs text-white/30">Search flights and compare environmental impact side by side.</p>
          </div>
          <Link
            href="/compare"
            className="rounded-lg bg-white/10 px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-white/15"
          >
            Compare Flights
          </Link>
        </motion.div>

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
