"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { FlightSearchParams } from "@/lib/types/flight";

interface FlightSearchProps {
  onSearch: (params: FlightSearchParams) => void;
  isLoading: boolean;
}

export function FlightSearch({ onSearch, isLoading }: FlightSearchProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (origin && destination && date) {
      onSearch({
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        date,
      });
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="origin">From</Label>
            <Input
              id="origin"
              placeholder="JFK"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              maxLength={3}
              className="uppercase"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="destination">To</Label>
            <Input
              id="destination"
              placeholder="LAX"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              maxLength={3}
              className="uppercase"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isLoading || !origin || !destination || !date}>
            {isLoading ? "Searching..." : "Compare Flights"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
