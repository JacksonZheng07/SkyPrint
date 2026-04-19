export type Grade = "A" | "B" | "C" | "D" | "F";

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
    label: "Good",
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

export function scoreToGrade(score: number): Grade {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "F";
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

export function categoryGradientBar(value: number): string {
  if (value >= 60) return "bg-gradient-to-r from-green-500 to-emerald-400";
  if (value >= 40) return "bg-gradient-to-r from-amber-400 to-yellow-400";
  return "bg-gradient-to-r from-red-500 to-orange-400";
}
