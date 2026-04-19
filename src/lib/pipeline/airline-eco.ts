import { AIRLINE_DATA } from "./airline-data";
import { computeCategories, computeOverallScore, scoreToTier } from "./airline-scoring";
import {
  scoreToPlusMinusGrade,
  pmGradeBaseGrade,
  pmGradeLabel,
  GRADE_STYLES,
  type PlusMinusGrade,
} from "@/lib/utils/grades";

export interface DerivedAirlineEco {
  grade: string;
  gradeLabel: string;
  gradeColor: string;
  tier: string;
  contrailProgram: boolean;
  safAdoption: number;
  fleetEfficiency: string;
  emissionsTrend: "improving" | "flat" | "worsening";
  commitments: string;
}

function fleetEfficiencyLabel(score: number): string {
  if (score >= 70) return "High";
  if (score >= 55) return "Above Avg";
  if (score >= 40) return "Average";
  return "Below Avg";
}

function deriveTrend(contrailProgram: boolean, fleetAge: number, safPercent: number): "improving" | "flat" | "worsening" {
  if (contrailProgram || safPercent >= 0.5) return "improving";
  if (fleetAge > 14 && safPercent < 0.1) return "worsening";
  return "flat";
}

export function deriveAirlineEco(code: string): DerivedAirlineEco {
  const data = AIRLINE_DATA[code.toUpperCase()];
  if (!data) {
    return {
      grade: "C",
      gradeLabel: "Average",
      gradeColor: "text-amber-400 border-amber-400/30 bg-amber-500/15",
      tier: "Unranked",
      contrailProgram: false,
      safAdoption: 0,
      fleetEfficiency: "Unknown",
      emissionsTrend: "flat",
      commitments: "No public data available",
    };
  }

  const categories = computeCategories(data);
  const overallScore = computeOverallScore(categories);
  const pmGrade = scoreToPlusMinusGrade(overallScore);
  const base = pmGradeBaseGrade(pmGrade);
  const style = GRADE_STYLES[base];
  const tier = scoreToTier(overallScore);
  const trend = deriveTrend(data.contrailProgramActive, data.fleet.averageAge, data.safPercent);

  return {
    grade: pmGrade,
    gradeLabel: pmGradeLabel(pmGrade),
    gradeColor: `${style.text} ${style.border} bg-${base === "A" ? "emerald" : base === "B" ? "green" : base === "C" ? "amber" : base === "D" ? "orange" : "red"}-500/15`,
    tier,
    contrailProgram: data.contrailProgramActive,
    safAdoption: data.safPercent,
    fleetEfficiency: fleetEfficiencyLabel(categories.fleetEfficiency),
    emissionsTrend: trend,
    commitments: data.contrailProgramActive
      ? `Active contrail avoidance program, ${data.safPercent}% SAF adoption`
      : `${data.safPercent}% SAF adoption, fleet avg age ${data.fleet.averageAge}y`,
  };
}
