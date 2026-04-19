"use client";

import { useEffect, useState } from "react";
import type { FlightSelection } from "@/components/shared/flight-picker";
import { AirlineLogo } from "@/components/compare/airline-logo";
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

interface Props {
  onSelect: (flight: FlightSelection) => void;
  isLoading?: boolean;
  selectedCallsign?: string | null;
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

const ICAO_TO_AIRLINE_IATA: Record<string, string> = {
  AAL: "AA",
  BAW: "BA",
  DAL: "DL",
  UAL: "UA",
  VIR: "VS",
  DLH: "LH",
  AFR: "AF",
  KLM: "KL",
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

export function DarkFlightList({ onSelect, isLoading, selectedCallsign }: Props) {
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
      destIata.includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageFlights = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const pagesToShow = (() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const half = 2;
    let start = Math.max(1, safePage - half);
    const end = Math.min(totalPages, start + 4);
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

  if (fetching) {
    return (
      <div className="space-y-2 px-1 pt-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl border border-white/[0.04] bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 text-center text-sm text-white/40">
        No pipeline flights available.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          placeholder="Search flights..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-xs text-white placeholder:text-white/30 backdrop-blur-sm transition-colors focus:border-white/15 focus:bg-white/[0.06] focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-center text-xs text-white/40">
          No flights match &ldquo;{query}&rdquo;
        </div>
      ) : (
        <>
          <div className="space-y-1">
            {pageFlights.map((f) => {
              const origin = toIata(f.dep);
              const dest = toIata(f.arr);
              const airlineName = AIRLINE_NAMES[f.airline] ?? f.airline;
              const isSelected = selectedCallsign === f.callsign.trim();
              return (
                <button
                  key={`${f.icao24}_${f.first_seen}`}
                  onClick={() => handleSelect(f)}
                  disabled={isLoading}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSelected
                      ? "border border-emerald-500/40 bg-emerald-500/10 shadow-lg shadow-emerald-500/5"
                      : "border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.08]"
                  }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden ${
                    isSelected ? "bg-emerald-500/20" : "bg-white/[0.06]"
                  }`}>
                    <AirlineLogo code={ICAO_TO_AIRLINE_IATA[f.airline] ?? f.airline} size={28} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-xs ${isSelected ? "text-emerald-100" : "text-white"}`}>{f.callsign.trim()}</span>
                      <span className={`text-[10px] truncate ${isSelected ? "text-emerald-300/60" : "text-white/40"}`}>{airlineName}</span>
                    </div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? "text-emerald-300/40" : "text-white/30"}`}>
                      {origin} &rarr; {dest}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className={`text-[10px] ${isSelected ? "text-emerald-300/50" : "text-white/40"}`}>{formatDate(f.first_seen)}</div>
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
                className="flex h-7 w-7 items-center justify-center rounded text-xs text-white/40 hover:bg-white/10 disabled:opacity-30"
              >
                ‹
              </button>

              {pagesToShow[0] > 1 && (
                <>
                  <button onClick={() => setPage(1)} className="flex h-7 w-7 items-center justify-center rounded text-xs text-white/60 hover:bg-white/10">1</button>
                  {pagesToShow[0] > 2 && <span className="px-1 text-xs text-white/30">…</span>}
                </>
              )}

              {pagesToShow.map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition-all ${
                    p === safePage
                      ? "bg-emerald-500/20 text-emerald-300 font-medium"
                      : "text-white/40 hover:bg-white/[0.06]"
                  }`}
                >
                  {p}
                </button>
              ))}

              {pagesToShow[pagesToShow.length - 1] < totalPages && (
                <>
                  {pagesToShow[pagesToShow.length - 1] < totalPages - 1 && (
                    <span className="px-1 text-xs text-white/30">…</span>
                  )}
                  <button onClick={() => setPage(totalPages)} className="flex h-7 w-7 items-center justify-center rounded text-xs text-white/60 hover:bg-white/10">
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded text-xs text-white/40 hover:bg-white/10 disabled:opacity-30"
              >
                ›
              </button>

              <span className="ml-1 text-[10px] text-white/30">{filtered.length} flights</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
