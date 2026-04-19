"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PodiumCard } from "@/components/airline/podium-card";
import { RankingRow } from "@/components/airline/ranking-row";
import type { AirlineScore } from "@/lib/types/airline";
import { CATEGORY_ORDER, CATEGORY_META } from "@/lib/utils/airline-categories";

const PANEL = {
  background: "linear-gradient(135deg, rgba(12,24,50,0.84) 0%, rgba(5,12,28,0.92) 100%)",
  backdropFilter: "blur(18px)",
  boxShadow: [
    "0 0 0 1px rgba(45,212,191,0.18)",
    "0 0 40px rgba(45,212,191,0.10)",
    "0 12px 40px rgba(0,0,0,0.50)",
    "inset 0 1px 0 rgba(255,255,255,0.09)",
    "inset 1px 0 0 rgba(45,212,191,0.07)",
  ].join(", "),
} as const;

const CATEGORY_MAX: Record<string, number> = {
  contrailMitigation: 30,
  fleetEfficiency: 25,
  routeOptimization: 25,
  sustainableFuel: 20,
};

export default function AirlinesPage() {
  const [scores, setScores] = useState<AirlineScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rankings")
      .then((r) => r.json())
      .then(setScores)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div
      className="relative min-h-screen text-white"
      style={{
        backgroundImage: "url('/airlines-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(4,10,22,0.72) 0%, rgba(4,10,22,0.60) 40%, rgba(4,10,22,0.74) 100%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl space-y-3 px-4 pb-16 pt-24">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-3 md:grid-cols-2"
        >
          {/* Left: title */}
          <div className="flex flex-col justify-center">
            <div
              className="mb-4 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-teal-300"
              style={{ background: "rgba(45,212,191,0.12)", border: "1px solid rgba(45,212,191,0.25)" }}
            >
              <span>✈</span> Climate Intelligence
            </div>
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-white">
              Airline Climate
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg,#2dd4bf,#34d399)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Rankings
              </span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              Who&apos;s leading the charge for cleaner skies? Rankings based on fleet efficiency,
              route optimization, contrail mitigation, and sustainable fuel adoption.
            </p>
          </div>

          {/* Right: feature badges */}
          <div className="rounded-2xl border border-teal-400/20 p-5" style={PANEL}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-teal-400/70">
              Methodology
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "📉", title: "Lower Impact", sub: "Better Rank" },
                { icon: "🔬", title: "Comprehensive", sub: "Methodology" },
                { icon: "🔄", title: "Updated", sub: "Monthly" },
                { icon: "🔓", title: "Transparent", sub: "& Open" },
              ].map((b) => (
                <div
                  key={b.title}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <span className="text-2xl">{b.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{b.title}</p>
                    <p className="text-xs text-white/45">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Podium + Scoring Breakdown */}
        {isLoading ? (
          <LoadingState />
        ) : scores.length >= 3 ? (
          <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
            {/* Podium */}
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-teal-400/70">
                Top 3
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <PodiumCard airline={scores[1]} rank={1} />
                <PodiumCard airline={scores[0]} rank={0} />
                <PodiumCard airline={scores[2]} rank={2} />
              </div>
            </div>

            {/* Scoring Breakdown sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-teal-400/20 p-5"
              style={{ ...PANEL, alignSelf: "start" }}
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-teal-400/70">
                Scoring Breakdown
              </p>
              <div className="space-y-4">
                {CATEGORY_ORDER.map((key) => {
                  const meta = CATEGORY_META[key];
                  const max = CATEGORY_MAX[key];
                  return (
                    <div key={key}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-white/80">
                          <span>{meta.icon}</span> {meta.label}
                        </span>
                        <span className="text-xs text-teal-400">{max} pts</span>
                      </div>
                      <div
                        className="h-1.5 w-full overflow-hidden rounded-full"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${max}%`,
                            background: "linear-gradient(90deg,#2dd4bf,#34d399)",
                          }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-white/35">{meta.description}</p>
                    </div>
                  );
                })}
                <div
                  className="mt-2 flex items-center justify-between rounded-lg px-3 py-2"
                  style={{ background: "rgba(45,212,191,0.08)", border: "1px solid rgba(45,212,191,0.18)" }}
                >
                  <span className="text-xs font-semibold text-white/70">Total</span>
                  <span className="text-sm font-bold text-teal-300">100 pts</span>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}

        {/* Full Rankings */}
        {!isLoading && scores.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-400/70">
                Full Rankings
              </p>
              <div className="h-px flex-1" style={{ background: "rgba(45,212,191,0.15)" }} />
            </div>
            {scores.map((airline, i) => (
              <RankingRow key={airline.airlineCode} airline={airline} index={i} />
            ))}
          </div>
        )}

        {/* Did You Know */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="rounded-2xl border border-teal-400/20 p-6 text-center"
            style={PANEL}
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-teal-400/70">
              Did You Know?
            </p>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/60">
              If all airlines adopted contrail-aware flight planning, we could eliminate up to{" "}
              <span className="font-bold text-white">35%</span> of aviation&apos;s total warming
              effect with less than <span className="font-bold text-white">1%</span> increase in
              fuel costs — equivalent to planting{" "}
              <span className="font-bold text-emerald-400">billions of trees</span> every year.
            </p>
          </motion.div>
        )}

      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div
          className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: "rgba(45,212,191,0.4)", borderTopColor: "transparent" }}
        />
        <p className="mt-4 text-sm text-white/40">Loading airline rankings...</p>
      </div>
    </div>
  );
}
