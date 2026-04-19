"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import type { FlightComparisonItem, ImpactSummary } from "@/lib/types/comparison";
import { BookingForm } from "./booking/booking-form";
import { BookingSuccess } from "./booking/booking-success";

interface BookingConfirmationProps {
  item: FlightComparisonItem;
  impactSummary: ImpactSummary | null;
  onConfirm: (phoneNumber: string) => void;
  onCancel: () => void;
  isBooking: boolean;
  isBooked: boolean;
  greenerAltIncluded?: boolean;
}

// Mock price derived from flight duration (minutes)
function computeMockPrice(durationMin: number): number {
  return Math.round(durationMin * 1.5 + 50);
}

export function BookingConfirmation({
  item,
  impactSummary,
  onConfirm,
  onCancel,
  isBooking,
  isBooked,
  greenerAltIncluded,
}: BookingConfirmationProps) {
  const price = computeMockPrice(item.flight.duration);

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
            <StatusStrip isBooked={isBooked} />
            <CardContent className="pt-6">
              {isBooked ? (
                <BookingSuccess impactSummary={impactSummary} onClose={onCancel} greenerAltIncluded={greenerAltIncluded} />
              ) : (
                <BookingForm
                  item={item}
                  price={price}
                  isBooking={isBooking}
                  onConfirm={onConfirm}
                  onCancel={onCancel}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function StatusStrip({ isBooked }: { isBooked: boolean }) {
  return (
    <div
      className={`h-2 ${
        isBooked
          ? "bg-gradient-to-r from-green-400 to-emerald-500"
          : "bg-gradient-to-r from-sky-400 to-blue-400"
      }`}
    />
  );
}
