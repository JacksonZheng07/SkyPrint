"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { ICAO_TO_IATA } from "@/lib/utils/airports";

interface ManifestFlight {
  icao24: string;
  callsign: string;
  airline: string;
  dep: string;
  arr: string;
  first_seen: number;
  last_seen: number;
}

export interface FlightSelection {
  callsign: string;
  origin: string;   // IATA
  destination: string; // IATA
  date: string;     // YYYY-MM-DD
  airline: string;
}

interface FlightPickerProps {
  onSelect: (flight: FlightSelection) => void;
  isLoading?: boolean;
  label?: string;
}

const AIRLINE_NAMES: Record<string, string> = {
  AAL: "American Airlines",
  BAW: "British Airways",
  DAL: "Delta Air Lines",
  UAL: "United Airlines",
  VIR: "Virgin Atlantic",
  DLH: "Lufthansa",
  AFR: "Air France",
  KLM: "KLM Royal Dutch Airlines",
};

const PER_PAGE = 10;

function toIata(icao: string): string {
  return ICAO_TO_IATA[icao] ?? icao;
}

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

function toYmd(unix: number): string {
  return new Date(unix * 1000).toISOString().split("T")[0];
}

export function FlightPicker({ onSelect, isLoading, label }: FlightPickerProps) {
  const [flights, setFlights] = useState<ManifestFlight[]>([]);
  const [fetching, setFetching] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/flights")
      .then((r) => r.json())
      .then((data) => setFlights(data.flights ?? []))
      .catch(() => setFlights([]))
      .finally(() => setFetching(false));
  }, []);

  const q = query.toLowerCase();
  const filtered = flights.filter((f) => {
    if (!q) return true;
    const originIata = toIata(f.dep).toLowerCase();
    const destIata = toIata(f.arr).toLowerCase();
    const airlineName = (AIRLINE_NAMES[f.airline] ?? "").toLowerCase();
    return (
      f.callsign.toLowerCase().includes(q) ||
      f.airline.toLowerCase().includes(q) ||
      airlineName.includes(q) ||
      originIata.includes(q) ||
      destIata.includes(q) ||
      f.dep.toLowerCase().includes(q) ||
      f.arr.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageFlights = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  // Show at most 5 page buttons centered around current page
  const pagesToShow = (() => {
    const total = totalPages;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const half = 2;
    let start = Math.max(1, safePage - half);
    const end = Math.min(total, start + 4);
    start = Math.max(1, end - 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

  function handleSelect(f: ManifestFlight) {
    if (isLoading) return;
    onSelect({
      callsign: f.callsign.trim(),
      origin: toIata(f.dep),
      destination: toIata(f.arr),
      date: toYmd(f.first_seen),
      airline: f.airline,
    });
  }

  function handleQueryChange(v: string) {
    setQuery(v);
    setPage(1);
  }

  if (fetching) {
    return (
      <div className="space-y-2">
        {label && <p className="text-sm font-medium text-muted-foreground">{label}</p>}
        <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
          Loading flights...
        </div>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
        No pipeline flights available. Run the pipeline first to populate flight data.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-medium text-muted-foreground">{label}</p>}

      <Input
        placeholder="Search by flight number, airline, or airport…"
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        className="max-w-md"
      />

      {filtered.length === 0 ? (
        <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
          No flights match &ldquo;{query}&rdquo;
        </div>
      ) : (
        <>
          <div className="rounded-lg border bg-card divide-y overflow-hidden">
            {pageFlights.map((f) => {
              const origin = toIata(f.dep);
              const dest = toIata(f.arr);
              const airlineName = AIRLINE_NAMES[f.airline] ?? f.airline;
              return (
                <button
                  key={`${f.icao24}_${f.first_seen}`}
                  onClick={() => handleSelect(f)}
                  disabled={isLoading}
                  className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {f.airline}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{f.callsign.trim()}</span>
                      <span className="text-xs text-muted-foreground">{airlineName}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {origin} → {dest}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-muted-foreground">{formatDate(f.first_seen)}</div>
                    <div className="text-xs font-mono text-muted-foreground/70 mt-0.5">
                      {origin} · {dest}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex h-8 w-8 items-center justify-center rounded text-sm text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ‹
              </button>

              {pagesToShow[0] > 1 && (
                <>
                  <button
                    onClick={() => setPage(1)}
                    className="flex h-8 w-8 items-center justify-center rounded text-sm hover:bg-muted"
                  >
                    1
                  </button>
                  {pagesToShow[0] > 2 && (
                    <span className="px-1 text-sm text-muted-foreground">…</span>
                  )}
                </>
              )}

              {pagesToShow.map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded text-sm transition-colors ${
                    p === safePage
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}

              {pagesToShow[pagesToShow.length - 1] < totalPages && (
                <>
                  {pagesToShow[pagesToShow.length - 1] < totalPages - 1 && (
                    <span className="px-1 text-sm text-muted-foreground">…</span>
                  )}
                  <button
                    onClick={() => setPage(totalPages)}
                    className="flex h-8 w-8 items-center justify-center rounded text-sm hover:bg-muted"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded text-sm text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ›
              </button>

              <span className="ml-2 text-xs text-muted-foreground">
                {filtered.length} flights
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
