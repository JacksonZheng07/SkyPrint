"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FlightComparisonItem } from "@/lib/types/comparison";

interface FlightHeaderProps {
  item: FlightComparisonItem;
  label?: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FlightHeader({ item, label }: FlightHeaderProps) {
  const { flight } = item;
  return (
    <Card>
      <CardContent className="pt-4">
        {label && (
          <Badge variant="secondary" className="mb-2 text-xs">
            {label}
          </Badge>
        )}
        <h3 className="font-semibold">
          {flight.airline || `${flight.airlineCode} ${flight.flightNumber}`}
        </h3>
        <p className="text-sm text-muted-foreground">
          {flight.airlineCode} {flight.flightNumber}
        </p>
        <p className="mt-1 text-sm">
          {flight.origin} &middot; {formatTime(flight.departureTime)} →{" "}
          {flight.destination} &middot; {formatTime(flight.arrivalTime)}
        </p>
      </CardContent>
    </Card>
  );
}
