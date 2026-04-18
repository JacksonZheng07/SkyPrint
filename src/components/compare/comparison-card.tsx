"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { FlightComparisonItem } from "@/lib/types/comparison";
import { formatContrailRisk, formatCo2, formatDuration } from "@/lib/utils/format";
import { ImpactBreakdown } from "./impact-breakdown";

interface ComparisonCardProps {
  item: FlightComparisonItem;
  isBest: boolean;
  index: number;
  onSelect?: (item: FlightComparisonItem) => void;
}

export function ComparisonCard({ item, isBest, index, onSelect }: ComparisonCardProps) {
  const { flight, contrail, metrics } = item;
  const risk = formatContrailRisk(metrics.riskRating);
  const isWorst = item.rank === 4 || metrics.riskRating === "high";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card
        className={
          isBest
            ? "border-2 border-green-500 shadow-md shadow-green-500/10"
            : isWorst
              ? "border border-red-200 dark:border-red-900"
              : "border"
        }
      >
        {/* Rank strip */}
        <div
          className={`h-1 rounded-t-lg ${
            isBest
              ? "bg-gradient-to-r from-green-400 to-emerald-500"
              : isWorst
                ? "bg-gradient-to-r from-red-400 to-orange-400"
                : "bg-gradient-to-r from-sky-400 to-blue-400"
          }`}
        />
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                {item.rank}
              </span>
              <span className="text-lg font-semibold">
                {flight.airlineCode} {flight.flightNumber}
              </span>
            </div>
            <div className="flex gap-1.5">
              {isBest && (
                <Badge className="bg-green-600 text-white">Cleanest</Badge>
              )}
              <Badge
                variant="outline"
                className={risk.color}
              >
                {risk.label}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {flight.airline} &middot; {flight.aircraftType}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <div>
              <p className="font-medium">{flight.origin}</p>
              <p className="text-muted-foreground">
                {new Date(flight.departureTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">
                {formatDuration(flight.duration)}
              </p>
              <div className="mx-4 mt-1 h-px w-20 bg-border" />
              <p className="text-xs text-muted-foreground">
                {flight.stops === 0
                  ? "Nonstop"
                  : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">{flight.destination}</p>
              <p className="text-muted-foreground">
                {new Date(flight.arrivalTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <Separator />

          <ImpactBreakdown
            co2Kg={contrail.co2Kg}
            contrailScore={metrics.impactScore}
            totalScore={item.totalImpactScore}
          />

          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-lg bg-muted/50 p-2">
              <p className="font-semibold">{formatCo2(contrail.co2Kg)}</p>
              <p className="text-xs text-muted-foreground">CO2/pax</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <p className="font-semibold">
                {Math.round(contrail.summary.contrailProbability * 100)}%
              </p>
              <p className="text-xs text-muted-foreground">Contrail Risk</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <p className="font-semibold">{item.totalImpactScore}</p>
              <p className="text-xs text-muted-foreground">Impact Score</p>
            </div>
          </div>

          {onSelect && (
            <Button
              className="w-full"
              variant={isBest ? "default" : "outline"}
              onClick={() => onSelect(item)}
            >
              Select Flight
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
