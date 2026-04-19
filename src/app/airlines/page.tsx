"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { AirlineScore } from "@/lib/types/airline";
import {
  CATEGORY_ORDER,
  CATEGORY_META,
} from "@/lib/utils/airline-categories";
import {
  GRADE_STYLES,
  scoreToPlusMinusGrade,
  pmGradeBaseGrade,
  pmGradeLabel,
  pmGradeBg,
  pmGradeLabelColor,
  percentileLabel,
} from "@/lib/utils/grades";
import { AirlineLogo } from "@/components/compare/airline-logo";

const ITEMS_PER_PAGE = 10;

export default function AirlinesPage() {
  const [scores, setScores] = useState<AirlineScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<AirlineScore | null>(null);

  useEffect(() => {
    fetch("/api/rankings")
      .then((r) => r.json())
      .then((data: AirlineScore[]) => {
        setScores(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const sorted = [...scores].sort((a, b) => b.overallScore - a.overallScore);
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const selectedRank = selected ? sorted.findIndex((s) => s.airlineCode === selected.airlineCode) + 1 : 0;

  return (
    <div
      className="relative -mt-14 min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/AirlinePhoto.png')" }}
    >
      <div className="absolute inset-0 bg-black/65" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 pb-16 pt-24 sm:px-8">
        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {/* Header row */}
            <motion.div
              className="flex items-start justify-between"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold tracking-tight text-white">Airlines Report Card</h1>
                  <span className="rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                    Q2 2025
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-white/45">
                  Grading airlines on climate impact performance<br />across key categories.
                </p>
              </div>

              {/* Mission card */}
              <div className="hidden lg:block max-w-[280px] rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 backdrop-blur-xl">
                <p className="text-xs leading-relaxed text-white/55">
                  Our mission is to drive transparency and better decisions for a cleaner future of aviation.
                </p>
                <Link href="/mission" className="mt-2 inline-block text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                  Learn more &rarr;
                </Link>
              </div>
            </motion.div>

            {/* Two-panel layout */}
            <motion.div
              className="mt-6 grid gap-6 lg:grid-cols-[1fr_440px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              {/* ── Left: Grades table ── */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div className="mb-1">
                  <h2 className="text-base font-semibold text-white">Overall Grades</h2>
                  <p className="text-[11px] text-white/30">Grades reflect total climate impact performance</p>
                </div>

                {/* Table header */}
                <div className="mt-4 grid grid-cols-[40px_36px_1fr_80px_100px_70px] items-center gap-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/25">
                  <span>Rank</span>
                  <span></span>
                  <span>Airline</span>
                  <span className="text-center">Overall Grade</span>
                  <span />
                  <span className="text-center text-[9px]">Trend<br />(vs last quarter)</span>
                </div>

                {/* Rows */}
                <div className="mt-2 space-y-1">
                  <AnimatePresence mode="popLayout">
                    {paginated.map((airline, i) => {
                      const globalIdx = (page - 1) * ITEMS_PER_PAGE + i;
                      const pmGrade = scoreToPlusMinusGrade(airline.overallScore);
                      const isSelected = selected?.airlineCode === airline.airlineCode;
                      const base = pmGradeBaseGrade(pmGrade);
                      const style = GRADE_STYLES[base];

                      const seed = airline.airlineCode.charCodeAt(0) * 7 + airline.airlineCode.charCodeAt(1) * 3;
                      const trendVal = ((seed % 7) - 3);
                      const trendIcon = trendVal > 0 ? "↑" : trendVal < 0 ? "↓" : "—";
                      const trendColor = trendVal > 0 ? "text-emerald-400" : trendVal < 0 ? "text-red-400" : "text-white/30";

                      return (
                        <motion.button
                          key={airline.airlineCode}
                          layout
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ duration: 0.3, delay: i * 0.02, ease: [0.25, 0.1, 0.25, 1] }}
                          onClick={() => setSelected(airline)}
                          className={`grid w-full grid-cols-[40px_36px_1fr_80px_100px_70px] items-center gap-3 rounded-xl px-3 py-3.5 text-left transition-all ${
                            isSelected
                              ? `border ${style.border} bg-white/[0.06]`
                              : "border border-transparent hover:bg-white/[0.04]"
                          }`}
                        >
                          <span className="text-base font-bold text-white/40">{globalIdx + 1}</span>

                          <AirlineLogo code={airline.airlineCode} size={28} />

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">{airline.airlineName}</p>
                          </div>

                          {/* Grade badge */}
                          <div className="flex justify-center">
                            <div className={`flex h-9 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${pmGradeBg(pmGrade)} text-sm font-black text-white shadow-sm`}>
                              {pmGrade}
                            </div>
                          </div>

                          {/* Label */}
                          <span className={`text-xs font-medium ${pmGradeLabelColor(pmGrade)}`}>
                            {pmGradeLabel(pmGrade)}
                          </span>

                          {/* Trend */}
                          <div className={`flex items-center justify-center gap-1 text-xs font-medium ${trendColor}`}>
                            <span>{trendIcon}</span>
                            <span>{Math.abs(trendVal)}</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <p className="text-[11px] text-white/15">Last updated: April 19, 2025</p>
                  <div className="flex items-center gap-3">
                    <button className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-medium text-white/40 hover:text-white/70 transition-colors">
                      View Full Methodology
                    </button>
                    {totalPages > 1 && (
                      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
                    )}
                  </div>
                </div>
              </div>

              {/* ── Right: Report card sidebar ── */}
              <AnimatePresence mode="wait">
                {selected && (
                  <motion.div
                    key={selected.airlineCode}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
                  >
                    <ReportCard airline={selected} rank={selectedRank} totalAirlines={sorted.length} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── Footer ── */}
            <motion.div
              className="mt-8 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5 backdrop-blur-xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              <div>
                <p className="text-sm font-semibold text-white">Driving better skies together.</p>
                <p className="text-xs text-white/30">Support airlines that lead in climate performance.</p>
              </div>
              <Link
                href="/compare"
                className="rounded-lg bg-white/10 px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-white/15"
              >
                Compare Airlines
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

function ReportCard({ airline, rank, totalAirlines }: { airline: AirlineScore; rank: number; totalAirlines: number }) {
  const pmGrade = scoreToPlusMinusGrade(airline.overallScore);
  const base = pmGradeBaseGrade(pmGrade);

  return (
    <div className="space-y-6">
      {/* Header: name + big grade + rank */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <AirlineLogo code={airline.airlineCode} size={40} />
            <h2 className="text-xl font-bold text-white">{airline.airlineName}</h2>
          </div>
          <p className="mt-0.5 text-[11px] text-white/30">Overall Grade</p>
          <div className="mt-2 flex items-center gap-3">
            <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${pmGradeBg(pmGrade)} text-2xl font-black text-white shadow-lg`}>
              {pmGrade}
            </div>
            <div>
              <p className={`text-sm font-semibold ${pmGradeLabelColor(pmGrade)}`}>{pmGradeLabel(pmGrade)}</p>
              <p className="text-xs text-white/35">
                {base === "A" ? "Among the best in the industry for climate performance."
                  : base === "B" ? "Above average climate performance across categories."
                  : base === "C" ? "Meets baseline industry standards."
                  : base === "D" ? "Below average — significant room for improvement."
                  : "Critical improvement needed across all categories."}
              </p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25">Rank</p>
          <p className="text-3xl font-bold text-white">{rank}</p>
          <p className="text-[11px] text-white/25">of {totalAirlines} airlines</p>
        </div>
      </div>

      {/* Category breakdown */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Category Breakdown</h3>
          <span className="text-[10px] text-white/20">Grading Scale</span>
        </div>

        <div className="space-y-2">
          {CATEGORY_ORDER.map((key) => {
            const meta = CATEGORY_META[key];
            const value = airline.categories[key];
            const catGrade = scoreToPlusMinusGrade(value);

            return (
              <div key={key} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white">{meta.label}</p>
                  <p className="text-[10px] text-white/25">{meta.description}</p>
                </div>

                <div className={`flex h-8 w-10 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${pmGradeBg(catGrade)} text-xs font-black text-white`}>
                  {catGrade}
                </div>

                <div className="w-[110px] flex-shrink-0 text-right">
                  <p className={`text-xs font-semibold ${pmGradeLabelColor(catGrade)}`}>{pmGradeLabel(catGrade)}</p>
                  <p className="text-[10px] text-white/25">{percentileLabel(value)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Narrative */}
      <div className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
        <p className="text-xs leading-relaxed text-white/40">{airline.narrative}</p>
      </div>

      {/* View full report */}
      <div className="flex justify-end">
        <Link
          href={`/airline/${airline.airlineCode.toLowerCase()}`}
          className="rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-medium text-white/60 transition-all hover:bg-white/10 hover:text-white"
        >
          View Full Report
        </Link>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
        <p className="mt-4 text-sm text-white/40">Loading report cards...</p>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (p: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded-md px-2 py-1 text-xs text-white/40 hover:text-white disabled:opacity-30"
      >
        &lt;
      </button>
      {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={`h-7 w-7 rounded-md text-xs font-medium transition-colors ${
            page === p
              ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          {p}
        </button>
      ))}
      {totalPages > 4 && (
        <>
          <span className="text-xs text-white/20">...</span>
          <button
            onClick={() => setPage(totalPages)}
            className={`h-7 w-7 rounded-md text-xs font-medium ${page === totalPages ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-400" : "text-white/40 hover:text-white/70"}`}
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="rounded-md px-2 py-1 text-xs text-white/40 hover:text-white disabled:opacity-30"
      >
        &gt;
      </button>
    </div>
  );
}
