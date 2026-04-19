"use client";

import type { FlightSearchParams } from "@/lib/types/flight";

const NYC_ROUTES = [
  { origin: "JFK", destination: "LHR", label: "London", flag: "🇬🇧" },
  { origin: "JFK", destination: "CDG", label: "Paris", flag: "🇫🇷" },
  { origin: "JFK", destination: "AMS", label: "Amsterdam", flag: "🇳🇱" },
  { origin: "JFK", destination: "FCO", label: "Rome", flag: "🇮🇹" },
  { origin: "JFK", destination: "MAD", label: "Madrid", flag: "🇪🇸" },
  { origin: "JFK", destination: "LAX", label: "Los Angeles", flag: "🇺🇸" },
  { origin: "JFK", destination: "MIA", label: "Miami", flag: "🇺🇸" },
  { origin: "JFK", destination: "ORD", label: "Chicago", flag: "🇺🇸" },
];

interface QuickRoutesProps {
  onSearch: (params: FlightSearchParams) => void;
  isLoading: boolean;
}

export function QuickRoutes({ onSearch, isLoading }: QuickRoutesProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Popular routes from New York</p>
      <div className="flex flex-wrap gap-2">
        {NYC_ROUTES.map((route) => (
          <button
            key={route.destination}
            disabled={isLoading}
            onClick={() =>
              onSearch({
                origin: route.origin,
                destination: route.destination,
                date: today,
                passengers: 1,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <span>{route.flag}</span>
            <span className="font-medium">{route.label}</span>
            <span className="text-muted-foreground text-xs">
              {route.origin} → {route.destination}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
