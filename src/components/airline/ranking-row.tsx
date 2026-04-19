"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { AirlineScore } from "@/lib/types/airline";
import { scoreToPlusMinusGrade, pmGradeBg } from "@/lib/utils/grades";
import { VerticalCategoryBars } from "./category-bars";

const RANK_EMOJI = ["🥇", "🥈", "🥉"];

interface RankingRowProps {
  airline: AirlineScore;
  index: number;
}

export function RankingRow({ airline, index }: RankingRowProps) {
  const pmGrade = scoreToPlusMinusGrade(airline.overallScore);
  const hasContrailProgram = airline.categories.contrailMitigation >= 50;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.05 }}
    >
      <Link href={`/airline/${airline.airlineCode.toLowerCase()}`}>
        <div
          className="group cursor-pointer overflow-hidden rounded-xl border transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(12,24,50,0.80) 0%, rgba(5,12,28,0.88) 100%)",
            backdropFilter: "blur(16px)",
            borderColor: "rgba(45,212,191,0.15)",
            boxShadow: "0 0 0 1px rgba(45,212,191,0.08), 0 4px 20px rgba(0,0,0,0.35)",
          }}
        >
          <div className="flex items-center gap-4 px-5 py-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white/70"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              {index < 3 ? RANK_EMOJI[index] : `#${index + 1}`}
            </div>
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${pmGradeBg(pmGrade)} text-lg font-bold text-white`}
              style={{ boxShadow: "0 0 16px rgba(0,0,0,0.4)" }}
            >
              {pmGrade}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white transition-colors group-hover:text-teal-300">
                {airline.airlineName}
              </h3>
              <div className="flex items-center gap-3 text-xs text-white/40">
                <span>Fleet: {airline.fleetProfile.totalAircraft}</span>
                <span>•</span>
                <span>Avg age: {airline.fleetProfile.averageAge}y</span>
                <span>•</span>
                <span>
                  Contrail program:{" "}
                  {hasContrailProgram ? (
                    <span className="font-medium text-emerald-400">Active</span>
                  ) : (
                    <span className="text-red-400">None</span>
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <VerticalCategoryBars categories={airline.categories} dark />
              <div className="text-right">
                <span className="text-2xl font-bold text-white">{airline.overallScore}</span>
                <span className="text-xs text-white/40">/100</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
