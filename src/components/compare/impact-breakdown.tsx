"use client";

import { motion } from "framer-motion";

interface ImpactBreakdownProps {
  co2Kg: number;
  contrailScore: number; // 0-100
  totalScore: number;
}

export function ImpactBreakdown({
  co2Kg,
  contrailScore,
  totalScore,
}: ImpactBreakdownProps) {
  // Normalize for the stacked bar
  const maxBar = 100;
  const co2Width = Math.min(40, (co2Kg / 300) * 40); // Normalize CO2 to ~40% max
  const contrailWidth = Math.min(60, contrailScore * 0.6); // Contrail gets up to 60%

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Climate Impact Breakdown</span>
        <span className="font-medium text-foreground">Score: {totalScore}</span>
      </div>
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full bg-zinc-400"
          initial={{ width: 0 }}
          animate={{ width: `${co2Width}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          title={`CO2: ${Math.round(co2Kg)}kg`}
        />
        <motion.div
          className="h-full bg-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${contrailWidth}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          title={`Contrail impact: ${contrailScore}/100`}
        />
      </div>
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-zinc-400" />
          <span className="text-muted-foreground">CO2</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-orange-500" />
          <span className="text-muted-foreground">Contrail Impact</span>
        </div>
      </div>
    </div>
  );
}
