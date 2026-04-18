"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { FlightComparisonItem, ImpactSummary } from "@/lib/types/comparison";
import { formatCo2, formatContrailRisk } from "@/lib/utils/format";
import { co2ToTrees, co2ToCarMiles } from "@/lib/utils/units";

interface BookingConfirmationProps {
  item: FlightComparisonItem;
  impactSummary: ImpactSummary | null;
  onConfirm: (phoneNumber: string) => void;
  onCancel: () => void;
  isBooking: boolean;
  isBooked: boolean;
}

export function BookingConfirmation({
  item,
  impactSummary,
  onConfirm,
  onCancel,
  isBooking,
  isBooked,
}: BookingConfirmationProps) {
  const [phone, setPhone] = useState("");
  const risk = formatContrailRisk(item.metrics.riskRating);
  const isBest = item.rank === 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="overflow-hidden shadow-2xl">
            {/* Status strip */}
            <div
              className={`h-2 ${
                isBooked
                  ? "bg-gradient-to-r from-green-400 to-emerald-500"
                  : isBest
                    ? "bg-gradient-to-r from-green-400 to-emerald-500"
                    : "bg-gradient-to-r from-sky-400 to-blue-400"
              }`}
            />
            <CardContent className="pt-6">
              {isBooked ? (
                /* Booking confirmed */
                <div className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
                  >
                    <span className="text-3xl">✅</span>
                  </motion.div>
                  <h3 className="text-xl font-bold">Flight Selected!</h3>
                  <p className="text-sm text-muted-foreground">
                    You&apos;ll receive notifications about your flight&apos;s climate impact via iMessage.
                  </p>
                  {impactSummary && impactSummary.co2Saved > 0 && (
                    <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                      <p className="font-semibold text-green-700 dark:text-green-400">
                        🌳 You saved {formatCo2(impactSummary.co2Saved)} vs the worst option!
                      </p>
                      <p className="mt-1 text-sm text-green-600 dark:text-green-500">
                        That&apos;s {co2ToTrees(impactSummary.co2Saved)} trees absorbing CO2 for a year,
                        or {co2ToCarMiles(impactSummary.co2Saved)} fewer car miles.
                      </p>
                    </div>
                  )}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>📱 Booking confirmation → Now</p>
                    <p>🌤️ Pre-flight contrail forecast → 24h before departure</p>
                    <p>📊 Post-flight impact summary → After landing</p>
                  </div>
                  <Button onClick={onCancel} className="w-full">
                    Done
                  </Button>
                </div>
              ) : (
                /* Booking form */
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold">Confirm Flight Selection</h3>
                    <p className="text-sm text-muted-foreground">
                      Get climate impact notifications via iMessage
                    </p>
                  </div>

                  {/* Flight summary */}
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div>
                      <span className="font-semibold">
                        {item.flight.airlineCode} {item.flight.flightNumber}
                      </span>
                      <p className="text-xs text-muted-foreground">{item.flight.airline}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm">
                        {item.flight.origin} → {item.flight.destination}
                      </span>
                      <div className="flex gap-1.5 justify-end mt-1">
                        {isBest && (
                          <Badge className="bg-green-600 text-white text-[10px]">Cleanest</Badge>
                        )}
                        <Badge variant="outline" className={`text-[10px] ${risk.color}`}>
                          {risk.label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Impact metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="font-bold">{formatCo2(item.contrail.co2Kg)}</p>
                      <p className="text-[10px] text-muted-foreground">CO2</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="font-bold">
                        {Math.round(item.contrail.summary.contrailProbability * 100)}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">Contrail Risk</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="font-bold">{item.totalImpactScore}</p>
                      <p className="text-[10px] text-muted-foreground">Impact</p>
                    </div>
                  </div>

                  {/* Phone number input */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (for iMessage notifications)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Powered by Photon — you&apos;ll get pre-flight forecasts and post-flight impact summaries.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={onCancel} className="flex-1">
                      Cancel
                    </Button>
                    <Button
                      onClick={() => onConfirm(phone)}
                      disabled={isBooking}
                      className="flex-1"
                    >
                      {isBooking ? "Confirming..." : "Confirm & Track"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
