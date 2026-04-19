"use client";

import { motion } from "framer-motion";
import type { FlightComparisonItem } from "@/lib/types/comparison";
import { formatContrailRisk, formatDuration } from "@/lib/utils/format";
import { ScoreCircle } from "./score-circle";
import { AirlineLogo } from "./airline-logo";

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
  const { flight, metrics } = item;
  const risk = formatContrailRisk(metrics.riskRating);
  const badge = getBadge(item, isBest);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className={`group relative overflow-hidden rounded-xl border backdrop-blur-xl transition-all ${
        isBest
          ? "border-emerald-500/40 bg-emerald-500/10 shadow-lg shadow-emerald-500/5"
          : selected
            ? "border-sky-500/40 bg-white/10"
            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
      }`}
    >
      <div className="flex flex-col gap-3 p-4 sm:p-5">
        {/* Main row */}
        <div className="flex items-center gap-4">
          {/* Checkbox */}
          {onToggleSelect && (
            <button
              onClick={() => onToggleSelect(flight.flightId)}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                selected
                  ? "border-emerald-500 bg-emerald-600 text-white"
                  : "border-white/30 bg-white/5 hover:border-white/50"
              }`}
            >
              {selected && (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </button>
          )}

          {/* Airline logo + info */}
          <div className="flex items-center gap-3 min-w-[160px]">
            <AirlineLogo code={flight.airlineCode} size={40} />
            <div>
              <p className="font-semibold text-white">
                {flight.airline || flight.airlineCode}
              </p>
              <p className="text-xs text-white/50">
                {flight.airlineCode} {flight.flightNumber}
              </p>
            </div>
          </div>

          {/* Departure time */}
          <div className="flex flex-col items-start min-w-[80px]">
            <span className="text-base font-bold text-white">
              {formatTime(flight.departureTime)}
            </span>
            <span className="text-[11px] text-white/40">
              {formatShortDate(flight.departureTime)}
            </span>
          </div>

          {/* Route line */}
          <div className="hidden flex-1 flex-col items-center gap-0.5 sm:flex">
            <span className="text-[11px] text-white/40">
              {formatDuration(flight.duration)}
            </span>
            <div className="relative flex w-full items-center">
              <div className="h-px w-full border-t border-dashed border-white/30" />
              <svg
                className="absolute -right-1 h-4 w-4 text-white/40"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3.64 14.26c.24-.16.53-.24.85-.24h1.33l1.54 1.87c.35.43.88.69 1.44.69h1.82l-1.63-2.56h2.1l.89.84c.15.15.33.26.53.32l.3.09h.37c.33 0 .6-.27.6-.6v-.06c0-.11-.03-.22-.09-.32l-.75-1.29.75-1.29c.06-.1.09-.21.09-.32v-.06c0-.33-.27-.6-.6-.6h-.37l-.3.09c-.2.06-.38.17-.53.32l-.89.84h-2.1l1.63-2.56H8.8c-.56 0-1.09.26-1.44.69L5.82 11.5H4.49c-.32 0-.61-.08-.85-.24C3.24 11.03 3 10.6 3 10.15v-.17c0-.13.01-.25.02-.37l.63-4.03C3.89 4.12 5.14 3 6.63 3H17.4c1.49 0 2.73 1.12 2.97 2.58l.63 4.03c.01.12.02.24.02.37v.17c0 .45-.24.88-.64 1.11-.24.16-.53.24-.85.24h-1.33l-1.54 1.87c-.35.43-.88.69-1.44.69h-1.82l1.63-2.56h-2.1l-.89.84c-.15.15-.33.26-.53.32l-.3.09h-.37c-.33 0-.6-.27-.6-.6v-.06c0-.11.03-.22.09-.32l.75-1.29-.75-1.29c-.06-.1-.09-.21-.09-.32v-.06c0-.33.27-.6.6-.6h.37l.3.09c.2.06.38.17.53.32l.89.84h2.1L13.2 8.44h1.82c.56 0 1.09.26 1.44.69l1.54 1.87h1.33c.32 0 .61.08.85.24.4.23.64.66.64 1.11v.17c0 .13-.01.25-.02.37l-.63 4.03C19.93 18.38 18.69 19.5 17.2 19.5H6.63c-1.49 0-2.73-1.12-2.97-2.58l-.63-4.03C3.01 12.77 3 12.65 3 12.52v-.17c0-.45.24-.88.64-1.11z" />
              </svg>
            </div>
            {flight.stops > 0 && (
              <span className="text-[10px] text-amber-400">
                {flight.stops} stop{flight.stops > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Arrival time */}
          <div className="flex flex-col items-start min-w-[80px]">
            <span className="text-base font-bold text-white">
              {formatTime(flight.arrivalTime)}
              {arrivesNextDay(flight.departureTime, flight.arrivalTime) && (
                <sup className="ml-0.5 text-[10px] font-normal text-white/40">
                  {arrivalDayOffset(flight.departureTime, flight.arrivalTime)}
                </sup>
              )}
            </span>
            <span className="text-[11px] text-white/40">
              {formatShortDate(flight.arrivalTime)}
            </span>
          </div>

          {/* Contrail risk badge */}
          <div className="hidden md:flex">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                metrics.riskRating === "low"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : metrics.riskRating === "medium"
                    ? "bg-amber-500/15 text-amber-400"
                    : "bg-red-500/15 text-red-400"
              }`}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                {metrics.riskRating === "low" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : metrics.riskRating === "medium" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                )}
              </svg>
              {risk.label}
            </span>
          </div>

          {/* Total Impact label */}
          <div className="hidden text-right text-[11px] text-white/40 lg:block min-w-[60px]">
            <p>Total Impact</p>
            {item.confidenceLevel === "low" && <p>Est. only</p>}
          </div>

          {/* Score circle */}
          <ScoreCircle score={item.totalImpactScore} size="sm" />

          {/* Badge */}
          <div className="hidden min-w-[100px] lg:flex lg:justify-end">
            {badge && (
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${badge.className}`}>
                {badge.label}
              </span>
            )}
          </div>
        </div>

        {/* Impact copy */}
        {item.impactCopy && (
          <p className="border-t border-white/5 pt-2.5 text-xs leading-relaxed text-white/50">
            {item.impactCopy}
          </p>
        )}
      </div>

      {/* Click to select overlay */}
      {onSelect && (
        <button
          onClick={() => onSelect(item)}
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
          aria-label={`Select ${flight.airline || flight.airlineCode} flight`}
        />
      )}
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
    return { label: "Lowest Impact", className: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" };
  }
  if (item.metrics.riskRating === "high") {
    return { label: "Contrail-Sensitive", className: "bg-orange-500/20 text-orange-400 border border-orange-500/30" };
  }
  if (item.warmingRatio >= 2.0) {
    return { label: "Much Higher Impact", className: "bg-red-500/20 text-red-400 border border-red-500/30" };
  }
  if (item.warmingRatio >= 1.4) {
    return { label: "Higher Impact", className: "bg-red-500/15 text-red-400/80 border border-red-500/20" };
  }
  if (item.warmingRatio < 1.1) {
    return { label: "Similar Impact", className: "bg-sky-500/15 text-sky-400/80 border border-sky-500/20" };
  }
  return null;
}
