"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { FlightComparisonItem } from "@/lib/types/comparison";
import { formatContrailRisk, formatCo2, formatDuration } from "@/lib/utils/format";
import { ContrailBlocks } from "./contrail-blocks";
import { ScoreCircle } from "./score-circle";
import { ImpactTooltip } from "./impact-tooltip";

interface ComparisonCardProps {
  item: FlightComparisonItem;
  isBest: boolean;
  index: number;
  selected?: boolean;
  onSelect?: (item: FlightComparisonItem) => void;
  onToggleSelect?: (id: string) => void;
}

export function ComparisonCard({
  item,
  isBest,
  index,
  selected,
  onSelect,
  onToggleSelect,
}: ComparisonCardProps) {
  const { flight, contrail, metrics } = item;
  const risk = formatContrailRisk(metrics.riskRating);
  const isWorst = item.rank === 4 || metrics.riskRating === "high";

  const riskDotColor =
    metrics.riskRating === "low"
      ? "bg-emerald-500"
      : metrics.riskRating === "medium"
        ? "bg-amber-400"
        : "bg-red-500";

  const badge = getBadge(item, isBest);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
    >
      <Card
        className={`overflow-hidden transition-all hover:shadow-md ${
          isBest
            ? "border-2 border-emerald-500 shadow-sm shadow-emerald-500/10"
            : selected
              ? "border-2 border-sky-500"
              : isWorst
                ? "border border-red-200 dark:border-red-900"
                : "border"
        }`}
      >
        {/* Thin rank strip */}
        <div
          className={`h-1 ${
            isBest
              ? "bg-gradient-to-r from-green-400 to-emerald-500"
              : isWorst
                ? "bg-gradient-to-r from-red-400 to-orange-400"
                : "bg-gradient-to-r from-sky-400 to-blue-400"
          }`}
        />
        <CardContent className="py-3 px-4">
          {/* Main row */}
          <div className="flex items-center gap-4">
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggleSelect(flight.flightId)}
                className="h-4 w-4 shrink-0 rounded border-border accent-emerald-600"
              />
            )}

            {/* Airline info */}
            <div className="flex items-center gap-2 min-w-[140px]">
              <div className={`h-3 w-3 shrink-0 rounded-full ${riskDotColor}`} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm">
                    {flight.airline || `${flight.airlineCode} ${flight.flightNumber}`}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {flight.flightNumber}
                  {flight.stops > 0 && (
                    <span className="ml-1 text-amber-600 dark:text-amber-400">
                      · {flight.stops} stop{flight.stops > 1 ? "s" : ""}
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Route times */}
            <div className="flex items-center gap-2 min-w-[200px] text-sm">
              <div className="flex flex-col">
                <span className="font-medium">
                  {formatTime(flight.departureTime)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatShortDate(flight.departureTime)}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-muted-foreground">
                  {formatDuration(flight.duration)}
                </span>
                <div className="h-px w-10 bg-border" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">
                  {formatTime(flight.arrivalTime)}
                  {arrivesNextDay(flight.departureTime, flight.arrivalTime) && (
                    <sup className="ml-0.5 text-[9px] text-muted-foreground">
                      {arrivalDayOffset(flight.departureTime, flight.arrivalTime)}
                    </sup>
                  )}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatShortDate(flight.arrivalTime)}
                </span>
              </div>
            </div>

            {/* Contrail impact blocks */}
            <div className="hidden sm:flex flex-col items-center gap-0.5 min-w-[60px]">
              <ContrailBlocks score={metrics.impactScore} size="sm" />
              <span className="text-[10px] text-muted-foreground">
                {risk.label}
              </span>
            </div>

            {/* CO2 */}
            <div className="hidden md:block text-center min-w-[80px]">
              <p className="text-sm font-semibold">{formatCo2(contrail.co2Kg)}</p>
              <p className="text-[10px] text-muted-foreground">CO₂/pax</p>
            </div>

            {/* Price */}
            {typeof flight.price === "number" && (
              <div className="hidden md:block text-center min-w-[60px]">
                <p className="text-sm font-semibold">${flight.price}</p>
                <p className="text-[10px] text-muted-foreground">per person</p>
              </div>
            )}

            {/* Total Impact Score + badge */}
            <div className="ml-auto flex items-center gap-3">
              <div className="flex flex-col items-center gap-0.5">
                <ScoreCircle score={item.totalImpactScore} size="sm" label="Total Impact" />
                <ImpactTooltip
                  co2Kg={contrail.co2Kg}
                  contrailScore={metrics.impactScore}
                  totalScore={item.totalImpactScore}
                  usedFallback={contrail.usedFallback}
                />
              </div>

              <div className="flex flex-col gap-1 min-w-[110px]">
                {badge && (
                  <Badge className={`${badge.className} text-[10px] whitespace-nowrap`}>
                    {badge.label}
                  </Badge>
                )}
                {item.confidenceLevel === "low" && (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground border-muted whitespace-nowrap">
                    Est. only
                  </Badge>
                )}
              </div>
            </div>

            {onSelect && (
              <button
                onClick={() => onSelect(item)}
                className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
              >
                Select
              </button>
            )}
          </div>

          {/* Impact copy row */}
          {item.impactCopy && (
            <p className="mt-2 text-xs text-muted-foreground border-t border-border/50 pt-2 leading-relaxed">
              {item.impactCopy}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function formatTime(iso: string): string {
  if (!iso) return "--:--";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatShortDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

function arrivesNextDay(dep: string, arr: string): boolean {
  if (!dep || !arr) return false;
  const d = new Date(dep);
  const a = new Date(arr);
  return a.getUTCDate() !== d.getUTCDate() || a.getUTCMonth() !== d.getUTCMonth();
}

function arrivalDayOffset(dep: string, arr: string): string {
  if (!dep || !arr) return "";
  const diff = Math.round(
    (new Date(arr).getTime() - new Date(dep).getTime()) / 86400000
  );
  return diff === 1 ? "+1" : `+${diff}`;
}

function getBadge(
  item: FlightComparisonItem,
  isBest: boolean
): { label: string; className: string } | null {
  if (isBest) {
    return { label: "Lowest Impact", className: "bg-emerald-600 text-white" };
  }
  if (item.metrics.riskRating === "high") {
    return {
      label: "Contrail-Sensitive",
      className: "bg-orange-500 text-white",
    };
  }
  if (item.warmingRatio >= 2.0) {
    return {
      label: "Much Higher Impact",
      className: "bg-red-600 text-white",
    };
  }
  if (item.warmingRatio >= 1.4) {
    return {
      label: "Higher Impact",
      className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border border-red-200 dark:border-red-800",
    };
  }
  if (item.warmingRatio < 1.1) {
    return {
      label: "Similar Impact",
      className: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400 border border-sky-200 dark:border-sky-800",
    };
  }
  return null;
}
