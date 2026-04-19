"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { AirlineScore } from "@/lib/types/airline";
import { GRADE_STYLES, type Grade } from "@/lib/utils/grades";
import { HorizontalCategoryBars } from "./category-bars";

const RANK_EMOJI = ["🥇", "🥈", "🥉"];

const PANEL_BASE = {
  background: "linear-gradient(135deg, rgba(12,24,50,0.84) 0%, rgba(5,12,28,0.92) 100%)",
  backdropFilter: "blur(18px)",
  boxShadow: "0 0 0 1px rgba(45,212,191,0.18), 0 0 40px rgba(45,212,191,0.10), 0 12px 40px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.09)",
} as const;

const PANEL_FIRST = {
  background: "linear-gradient(135deg, rgba(16,32,62,0.90) 0%, rgba(8,18,40,0.96) 100%)",
  backdropFilter: "blur(18px)",
  boxShadow: "0 0 0 1px rgba(251,191,36,0.40), 0 0 48px rgba(251,191,36,0.14), 0 16px 48px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.12)",
} as const;

interface PodiumCardProps {
  airline: AirlineScore;
  rank: 0 | 1 | 2;
}

export function PodiumCard({ airline, rank }: PodiumCardProps) {
  const style = GRADE_STYLES[airline.overallGrade as Grade];
  const isFirst = rank === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + rank * 0.15 }}
      className={isFirst ? "md:-mt-4" : "md:mt-4"}
    >
      <Link href={`/airline/${airline.airlineCode.toLowerCase()}`}>
        <div
          className="group cursor-pointer overflow-hidden rounded-2xl border transition-all"
          style={{
            ...(isFirst ? PANEL_FIRST : PANEL_BASE),
            borderColor: isFirst ? "rgba(251,191,36,0.35)" : "rgba(45,212,191,0.18)",
          }}
        >
          {/* Top accent bar */}
          <div
            className="h-1"
            style={{
              background: isFirst
                ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
                : "linear-gradient(90deg,rgba(45,212,191,0.6),rgba(45,212,191,0.2))",
            }}
          />

          <div className="px-5 pb-5 pt-5 text-center">
            <span className="text-4xl">{RANK_EMOJI[rank]}</span>
            <div className="mt-2">
              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${style.bg} text-2xl font-bold text-white`}
                style={{ boxShadow: "0 0 24px rgba(0,0,0,0.5)" }}
              >
                {airline.overallGrade}
              </div>
            </div>
            <h3 className="mt-3 text-lg font-bold text-white transition-colors group-hover:text-teal-300">
              {airline.airlineName}
            </h3>
            <span
              className="mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-medium text-white/60"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              {airline.airlineCode}
            </span>
            <div className="mt-3 text-3xl font-bold text-white">
              {airline.overallScore}
              <span className="text-sm font-normal text-white/40">/100</span>
            </div>
            <HorizontalCategoryBars categories={airline.categories} dark />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
