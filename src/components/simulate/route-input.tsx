"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AircraftType } from "@/lib/types/flight";

const AIRCRAFT_OPTIONS: { value: AircraftType; label: string }[] = [
  { value: "B738", label: "Boeing 737-800" },
  { value: "B789", label: "Boeing 787-9" },
  { value: "B77W", label: "Boeing 777-300ER" },
  { value: "A320", label: "Airbus A320" },
  { value: "A321", label: "Airbus A321" },
  { value: "A359", label: "Airbus A350-900" },
  { value: "A332", label: "Airbus A330-200" },
];

interface RouteInputProps {
  onSimulate: (params: {
    origin: string;
    destination: string;
    aircraftType: AircraftType;
    departureTime: string;
    cruiseAltitudeFt: number;
  }) => void;
  isLoading: boolean;
}

export function RouteInput({ onSimulate, isLoading }: RouteInputProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [aircraftType, setAircraftType] = useState<AircraftType>("B789");
  const [date, setDate] = useState("");
  const [cruiseAlt, setCruiseAlt] = useState("35000");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (origin && destination && date) {
      onSimulate({
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        aircraftType,
        departureTime: new Date(`${date}T10:00:00Z`).toISOString(),
        cruiseAltitudeFt: parseInt(cruiseAlt, 10) || 35000,
      });
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="sim-origin">From</Label>
              <Input
                id="sim-origin"
                placeholder="JFK"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                maxLength={3}
                className="uppercase"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="sim-dest">To</Label>
              <Input
                id="sim-dest"
                placeholder="LHR"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                maxLength={3}
                className="uppercase"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="sim-date">Date</Label>
              <Input
                id="sim-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label>Aircraft</Label>
              <Select
                value={aircraftType}
                onValueChange={(v) => setAircraftType(v as AircraftType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AIRCRAFT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label} ({opt.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="sim-alt">Cruise Altitude (ft)</Label>
              <Input
                id="sim-alt"
                type="number"
                value={cruiseAlt}
                onChange={(e) => setCruiseAlt(e.target.value)}
                min={25000}
                max={45000}
                step={1000}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !origin || !destination || !date}
            >
              {isLoading ? "Simulating..." : "Simulate Route"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
