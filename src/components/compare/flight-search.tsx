"use client";

import { useState } from "react";
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
  const [passengers, setPassengers] = useState(1);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (origin && destination) {
      onSearch({
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        date: date || new Date().toISOString().split("T")[0],
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
              placeholder="New York (JFK)"
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
              placeholder="London (LHR)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              maxLength={3}
              className="uppercase"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="date">Depart</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="w-24">
            <Label htmlFor="passengers">Passengers</Label>
            <Input
              id="passengers"
              type="number"
              min={1}
              max={9}
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !origin || !destination}
            className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-600 px-6 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
