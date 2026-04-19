"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import type { AirlineScore } from "@/lib/types/airline";
import {
  GRADE_STYLES,
  getTierColor,
  scoreToPlusMinusGrade,
  pmGradeBaseGrade,
  pmGradeBg,
  pmGradeLabel,
  pmGradeLabelColor,
} from "@/lib/utils/grades";
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
        <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:border-primary/30">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg font-bold">
              {index < 3 ? RANK_EMOJI[index] : `#${index + 1}`}
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${pmGradeBg(pmGrade)} text-lg font-bold text-white`}
            >
              {pmGrade}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {airline.airlineName}
                </h3>
                {airline.tier && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getTierColor(airline.tier)}`}>
                    {airline.tier}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Fleet: {airline.fleetProfile.totalAircraft}</span>
                <span>•</span>
                <span>Avg age: {airline.fleetProfile.averageAge}y</span>
                <span>•</span>
                <span>
                  Contrail program:{" "}
                  {hasContrailProgram ? (
                    <span className="text-green-500 font-medium">Active</span>
                  ) : (
                    <span className="text-red-400">None</span>
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <VerticalCategoryBars categories={airline.categories} />
              <div className="text-right">
                <span className="text-2xl font-bold">{airline.overallScore}</span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

