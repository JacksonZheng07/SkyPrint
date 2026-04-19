"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AirlineScore } from "@/lib/types/airline";
import { GRADE_STYLES, type Grade } from "@/lib/utils/grades";

function gradientStops(score: number): { start: string; end: string } {
  if (score >= 65) return { start: "#22c55e", end: "#10b981" };
  if (score >= 50) return { start: "#f59e0b", end: "#eab308" };
  return { start: "#ef4444", end: "#dc2626" };
}

function GradeCircle({ score, grade, textClass }: { score: number; grade: string; textClass: string }) {
  const dashLen = (score / 100) * 264;
  const { start, end } = gradientStops(score);
  return (
    <div className="relative">
      <svg className="h-28 w-28" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="url(#gradeGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dashLen} 264`}
          className="transition-all duration-1000"
          style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
        />
        <defs>
          <linearGradient id="gradeGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={start} />
            <stop offset="100%" stopColor={end} />
          </linearGradient>
        </defs>
        <text x="50" y="45" textAnchor="middle" className={`text-3xl font-bold ${textClass}`} fill="currentColor">
          {grade}
        </text>
        <text x="50" y="62" textAnchor="middle" className="text-[10px] fill-muted-foreground">
          {score}/100
        </text>
      </svg>
    </div>
  );
}

export function GradeHero({ score }: { score: AirlineScore }) {
  const style = GRADE_STYLES[score.overallGrade as Grade];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className={`overflow-hidden shadow-xl ${style.glow}`}>
        <div className={`bg-gradient-to-r ${style.bg} p-1`} />
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <GradeCircle score={score.overallScore} grade={score.overallGrade} textClass={style.text} />
            <div className="flex-1">
              <h2 className="text-3xl font-bold tracking-tight">{score.airlineName}</h2>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="secondary">{score.airlineCode}</Badge>
                <Badge className={`bg-gradient-to-r ${style.bg} text-white border-0`}>{style.label}</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Environmental performance rating based on fleet efficiency, route optimization,
                contrail mitigation, and sustainable fuel adoption.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
