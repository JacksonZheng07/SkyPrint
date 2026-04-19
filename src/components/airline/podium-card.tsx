"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AirlineScore } from "@/lib/types/airline";
import { GRADE_STYLES, type Grade } from "@/lib/utils/grades";
import { HorizontalCategoryBars } from "./category-bars";

const RANK_EMOJI = ["🥇", "🥈", "🥉"];

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
        <Card
          className={`group cursor-pointer overflow-hidden transition-all hover:shadow-xl ${style.border} border-2`}
        >
          <div className={`bg-gradient-to-r ${style.bg} h-1.5`} />
          <CardContent className="pt-5 text-center">
            <span className="text-4xl">{RANK_EMOJI[rank]}</span>
            <div className="mt-2">
              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${style.bg} text-2xl font-bold text-white shadow-lg`}
              >
                {airline.overallGrade}
              </div>
            </div>
            <h3 className="mt-3 text-lg font-bold group-hover:text-primary transition-colors">
              {airline.airlineName}
            </h3>
            <div className="mt-1 flex items-center justify-center gap-1.5">
              <Badge variant="secondary">
                {airline.airlineCode}
              </Badge>
              {airline.tier && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getTierColor(airline.tier)}`}>
                  {airline.tier}
                </span>
              )}
            </div>
            <div className="mt-3 text-3xl font-bold">
              {airline.overallScore}
              <span className="text-sm font-normal text-muted-foreground">/100</span>
            </div>
            <HorizontalCategoryBars categories={airline.categories} />
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function getTierColor(tier: string): string {
  switch (tier) {
    case "Sky Saints": return "bg-emerald-500/15 text-emerald-400";
    case "Clean Cruisers": return "bg-sky-500/15 text-sky-400";
    case "Middle of the Pack": return "bg-amber-500/15 text-amber-400";
    case "Greenwash Gold Medalists": return "bg-orange-500/15 text-orange-400";
    case "Contrail Criminals": return "bg-red-500/15 text-red-400";
    default: return "bg-white/10 text-white/60";
  }
}
