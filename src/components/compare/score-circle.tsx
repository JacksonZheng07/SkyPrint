"use client";

import { motion } from "framer-motion";
import { formatImpactScore } from "@/lib/utils/format";

interface ScoreCircleProps {
  score: number; // 0-100 internal scale
  size?: "sm" | "lg";
  label?: string;
}

export function ScoreCircle({ score, size = "sm", label }: ScoreCircleProps) {
  const displayScore = formatImpactScore(score);
  const normalized = Math.min(score, 100) / 100;

  // Color based on 0-10 display scale (lower is better)
  const displayVal = score / 10;
  const color =
    displayVal <= 4
      ? "text-emerald-600 stroke-emerald-500"
      : displayVal <= 7
        ? "text-amber-500 stroke-amber-400"
        : "text-red-600 stroke-red-500";

  const dim = size === "lg" ? 96 : 56;
  const strokeWidth = size === "lg" ? 4 : 3;
  const radius = (dim - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-muted"
          />
          {/* Score ring */}
          <motion.circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={color}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - normalized) }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-bold leading-none ${color} ${
              size === "lg" ? "text-2xl" : "text-sm"
            }`}
          >
            {displayScore}
          </span>
          <span
            className={`text-muted-foreground ${
              size === "lg" ? "text-xs" : "text-[9px]"
            }`}
          >
            /10
          </span>
        </div>
      </div>
      {label && (
        <span className="text-xs text-muted-foreground">{label}</span>
      )}
    </div>
  );
}
