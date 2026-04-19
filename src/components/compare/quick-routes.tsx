"use client";

import type { FlightSearchParams } from "@/lib/types/flight";

const NYC_ROUTES = [
  { origin: "JFK", destination: "LHR", label: "London", flag: "\u{1F1EC}\u{1F1E7}" },
  { origin: "JFK", destination: "CDG", label: "Paris", flag: "\u{1F1EB}\u{1F1F7}" },
  { origin: "JFK", destination: "AMS", label: "Amsterdam", flag: "\u{1F1F3}\u{1F1F1}" },
  { origin: "JFK", destination: "FCO", label: "Rome", flag: "\u{1F1EE}\u{1F1F9}" },
  { origin: "JFK", destination: "MAD", label: "Madrid", flag: "\u{1F1EA}\u{1F1F8}" },
  { origin: "JFK", destination: "BOS", label: "Boston", flag: "\u{1F1FA}\u{1F1F8}" },
  { origin: "JFK", destination: "LAX", label: "Los Angeles", flag: "\u{1F1FA}\u{1F1F8}" },
  { origin: "JFK", destination: "MIA", label: "Miami", flag: "\u{1F1FA}\u{1F1F8}" },
];

interface QuickRoutesProps {
  onSearch: (params: FlightSearchParams) => void;
  isLoading: boolean;
}

export function QuickRoutes({ onSearch, isLoading }: QuickRoutesProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-3">
      <p className="text-sm text-white/50">Popular routes from New York</p>
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
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-50"
          >
            <span>{route.flag}</span>
            <span className="font-medium text-white/80">{route.label}</span>
            <span className="text-white/40 text-xs">
              {route.origin} &rarr; {route.destination}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
