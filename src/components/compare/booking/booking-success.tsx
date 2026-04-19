"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { ImpactSummary } from "@/lib/types/comparison";
import { formatCo2 } from "@/lib/utils/format";
import { co2ToTrees, co2ToCarMiles } from "@/lib/utils/units";

interface BookingSuccessProps {
  impactSummary: ImpactSummary | null;
  onClose: () => void;
}

export function BookingSuccess({ impactSummary, onClose }: BookingSuccessProps) {
  return (
    <div className="text-center space-y-4">
      <SuccessIcon />
      <div>
        <h3 className="text-xl font-bold">Booking Confirmed</h3>
        <p className="text-sm text-muted-foreground">
          We&apos;ll notify you and track your impact after your flight.
        </p>
      </div>
      {impactSummary && impactSummary.co2Saved > 0 && <ImpactSaved impact={impactSummary} />}
      <TimelineNotes />
      <Button onClick={onClose} className="w-full">
        Done
      </Button>
    </div>
  );
}

function SuccessIcon() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
    >
      <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </motion.div>
  );
}

function ImpactSaved({ impact }: { impact: ImpactSummary }) {
  return (
    <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
      <p className="font-semibold text-green-700 dark:text-green-400">
        You saved {formatCo2(impact.co2Saved)} vs the worst option!
      </p>
      <p className="mt-1 text-sm text-green-600 dark:text-green-500">
        That&apos;s {co2ToTrees(impact.co2Saved)} trees absorbing CO₂ for a year, or{" "}
        {co2ToCarMiles(impact.co2Saved)} fewer car miles.
      </p>
    </div>
  );
}

function TimelineNotes() {
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      <p>Booking confirmation → Now</p>
      <p>Pre-flight contrail forecast → 24h before departure</p>
      <p>Post-flight impact summary → After landing</p>
    </div>
  );
}
