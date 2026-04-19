"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { FlightComparisonItem } from "@/lib/types/comparison";
import { formatContrailRisk, formatCo2, formatDuration } from "@/lib/utils/format";
import { ContrailBlocks } from "./contrail-blocks";
import { ScoreCircle } from "./score-circle";

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
          <div className="flex items-center gap-4">
            {/* Checkbox for selection */}
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
                  {flight.airlineCode} {flight.flightNumber}
                </span>
              </div>
            </div>

            {/* Route times */}
            <div className="flex items-center gap-2 min-w-[160px] text-sm">
              <span className="font-medium">
                {new Date(flight.departureTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-muted-foreground">
                  {formatDuration(flight.duration)}
                </span>
                <div className="h-px w-12 bg-border" />
              </div>
              <span className="font-medium">
                {new Date(flight.arrivalTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
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
              <p className="text-[10px] text-muted-foreground">CO₂ Emissions</p>
            </div>

            {/* Total Impact Score */}
            <div className="ml-auto flex items-center gap-3">
              <ScoreCircle score={item.totalImpactScore} size="sm" label="Total Impact" />

              {/* Badges */}
              <div className="flex flex-col gap-1 min-w-[80px]">
                {isBest && (
                  <Badge className="bg-emerald-600 text-white text-[10px] whitespace-nowrap">
                    Best Overall
                  </Badge>
                )}
                {isWorst && (
                  <Badge variant="outline" className="text-red-500 border-red-300 text-[10px] whitespace-nowrap">
                    Highest Impact
                  </Badge>
                )}
              </div>
            </div>

            {/* Select button */}
            {onSelect && (
              <button
                onClick={() => onSelect(item)}
                className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
              >
                Select
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
