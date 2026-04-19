"use client";

import { Badge } from "@/components/ui/badge";
import { ContrailBlocks } from "@/components/compare/contrail-blocks";
import type { FlightComparisonItem } from "@/lib/types/comparison";
import { formatContrailRisk } from "@/lib/utils/format";

const RISK_BADGE_CLASS: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  high: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export function ContrailSection({ item }: { item: FlightComparisonItem }) {
  const risk = formatContrailRisk(item.metrics.riskRating);
  return (
    <div className="flex flex-col items-center gap-3">
      <ContrailBlocks score={item.metrics.impactScore} size="md" />
      <Badge className={RISK_BADGE_CLASS[item.metrics.riskRating] ?? RISK_BADGE_CLASS.medium}>
        {risk.label}
      </Badge>
      <p className="text-xs text-muted-foreground">
        {Math.round(item.contrail.summary.contrailProbability * 100)}% formation probability
      </p>
    </div>
  );
}
