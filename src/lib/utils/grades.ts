export type Grade = "A" | "B" | "C" | "D" | "F";

export type PlusMinusGrade = "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D+" | "D" | "D-" | "F";

export interface GradeStyle {
  bg: string;
  border: string;
  glow: string;
  text: string;
  label: string;
}

export const GRADE_STYLES: Record<Grade, GradeStyle> = {
  A: {
    bg: "from-green-500 to-emerald-600",
    border: "border-green-500/30",
    glow: "shadow-green-500/30",
    text: "text-green-500",
    label: "Excellent",
  },
  B: {
    bg: "from-green-400 to-teal-500",
    border: "border-green-400/30",
    glow: "shadow-green-400/30",
    text: "text-green-400",
    label: "Very Good",
  },
  C: {
    bg: "from-amber-400 to-yellow-500",
    border: "border-amber-400/30",
    glow: "shadow-amber-400/30",
    text: "text-amber-400",
    label: "Average",
  },
  D: {
    bg: "from-orange-500 to-red-400",
    border: "border-orange-500/30",
    glow: "shadow-orange-500/30",
    text: "text-orange-500",
    label: "Below Average",
  },
  F: {
    bg: "from-red-500 to-red-700",
    border: "border-red-500/30",
    glow: "shadow-red-500/30",
    text: "text-red-500",
    label: "Poor",
  },
};

/** Base grade (A-F) from score — used internally for style lookups. */
export function scoreToGrade(score: number): Grade {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "F";
}

/** Plus/minus grade from score — the canonical display grade used in report cards. */
export function scoreToPlusMinusGrade(score: number): PlusMinusGrade {
  if (score >= 88) return "A";
  if (score >= 80) return "A-";
  if (score >= 75) return "B+";
  if (score >= 68) return "B";
  if (score >= 63) return "B-";
  if (score >= 58) return "C+";
  if (score >= 50) return "C";
  if (score >= 45) return "C-";
  if (score >= 40) return "D+";
  if (score >= 35) return "D";
  if (score >= 28) return "D-";
  return "F";
}

/** Map a plus/minus grade to its base letter for style lookups. */
export function pmGradeBaseGrade(g: PlusMinusGrade): Grade {
  if (g.startsWith("A")) return "A";
  if (g.startsWith("B")) return "B";
  if (g.startsWith("C")) return "C";
  if (g.startsWith("D")) return "D";
  return "F";
}

/** Human-readable label for a plus/minus grade. */
export function pmGradeLabel(g: PlusMinusGrade): string {
  if (g === "A" || g === "A-") return "Excellent";
  if (g === "B+" || g === "B") return "Very Good";
  if (g === "B-") return "Good";
  if (g === "C+" || g === "C") return "Average";
  if (g === "C-" || g === "D+") return "Below Average";
  if (g === "D" || g === "D-") return "Poor";
  return "Poor";
}

/** Style helpers for plus/minus grades. */
export function pmGradeBg(g: PlusMinusGrade): string {
  return GRADE_STYLES[pmGradeBaseGrade(g)].bg;
}

export function pmGradeBorder(g: PlusMinusGrade): string {
  return GRADE_STYLES[pmGradeBaseGrade(g)].border;
}

export function pmGradeLabelColor(g: PlusMinusGrade): string {
  return GRADE_STYLES[pmGradeBaseGrade(g)].text;
}

/** Percentile label for a category score. */
export function percentileLabel(score: number): string {
  if (score >= 85) return "Top 5% of airlines";
  if (score >= 75) return "Top 10% of airlines";
  if (score >= 65) return "Top 15% of airlines";
  if (score >= 55) return "Top 25% of airlines";
  if (score >= 45) return "Above industry average";
  if (score >= 35) return "Industry average";
  if (score >= 25) return "Below industry average";
  return "Bottom quartile";
}

export function categoryBarColor(value: number): string {
  if (value >= 60) return "bg-green-500";
  if (value >= 40) return "bg-amber-400";
  return "bg-red-500";
}

export function categoryTextColor(value: number): string {
  if (value >= 60) return "text-green-500";
  if (value >= 40) return "text-amber-400";
  return "text-red-500";
}

export function getTierColor(tier: string): string {
  switch (tier) {
    case "Sky Saints": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "Clean Cruisers": return "bg-sky-500/15 text-sky-400 border-sky-500/30";
    case "Middle of the Pack": return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "Greenwash Gold Medalists": return "bg-orange-500/15 text-orange-400 border-orange-500/30";
    case "Contrail Criminals": return "bg-red-500/15 text-red-400 border-red-500/30";
    default: return "bg-white/10 text-white/60 border-white/10";
  }
}

export function categoryGradientBar(value: number): string {
  if (value >= 60) return "bg-gradient-to-r from-green-500 to-emerald-400";
  if (value >= 40) return "bg-gradient-to-r from-amber-400 to-yellow-400";
  return "bg-gradient-to-r from-red-500 to-orange-400";
}
