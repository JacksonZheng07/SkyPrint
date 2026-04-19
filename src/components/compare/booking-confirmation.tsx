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

// Mock price derived from flight duration
function getMockPrice(durationMin: number): number {
  return Math.round(durationMin * 1.5 + 50);
}

export function BookingConfirmation({
  item,
  impactSummary,
  onConfirm,
  onCancel,
  isBooking,
  isBooked,
}: BookingConfirmationProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [zip, setZip] = useState("");

  const risk = formatContrailRisk(item.metrics.riskRating);
  const price = getMockPrice(item.flight.duration);

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
          className="w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <Card className="overflow-hidden shadow-2xl">
            {/* Status strip */}
            <div
              className={`h-2 ${
                isBooked
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
                    <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold">Booking Confirmed</h3>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll notify you and track your impact after your flight.
                    </p>
                  </div>
                  {impactSummary && impactSummary.co2Saved > 0 && (
                    <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                      <p className="font-semibold text-green-700 dark:text-green-400">
                        You saved {formatCo2(impactSummary.co2Saved)} vs the worst option!
                      </p>
                      <p className="mt-1 text-sm text-green-600 dark:text-green-500">
                        That&apos;s {co2ToTrees(impactSummary.co2Saved)} trees absorbing CO₂ for a year,
                        or {co2ToCarMiles(impactSummary.co2Saved)} fewer car miles.
                      </p>
                    </div>
                  )}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Booking confirmation → Now</p>
                    <p>Pre-flight contrail forecast → 24h before departure</p>
                    <p>Post-flight impact summary → After landing</p>
                  </div>
                  <Button onClick={onCancel} className="w-full">
                    Done
                  </Button>
                </div>
              ) : (
                /* KNOT Booking form */
                <div className="space-y-5">
                  {/* KNOT branding + flight summary */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">KNOT</h3>
                      <p className="text-xs text-muted-foreground">Secure Booking</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">${price}</p>
                    </div>
                  </div>

                  {/* Route info */}
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-sm">
                          {item.flight.airline || `${item.flight.airlineCode} ${item.flight.flightNumber}`}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {item.flight.origin} → {item.flight.destination}
                        </p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${risk.color}`}>
                        {risk.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Passenger Details */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Passenger Details</h4>
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Payment</h4>
                    <div>
                      <Label htmlFor="card">Card Number</Label>
                      <Input
                        id="card"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="expiry">Expiry</Label>
                        <Input
                          id="expiry"
                          placeholder="12/28"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zip">Zip Code</Label>
                        <Input
                          id="zip"
                          placeholder="10001"
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => onConfirm(email)}
                    disabled={isBooking}
                    className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isBooking ? "Processing..." : `Pay $${price}`}
                  </button>

                  <p className="text-center text-[10px] text-muted-foreground">
                    Secure booking powered by Knot
                  </p>

                  <button
                    onClick={onCancel}
                    className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
