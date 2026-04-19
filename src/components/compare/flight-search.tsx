"use client";

import { useState } from "react";
import type { FlightSearchParams } from "@/lib/types/flight";

interface FlightSearchProps {
  onSearch: (params: FlightSearchParams) => void;
  isLoading: boolean;
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDateLabel(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function FlightSearch({ onSearch, isLoading }: FlightSearchProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(todayISO());
  const [passengers, setPassengers] = useState(1);
  const today = todayISO();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const chosenDate = date < today ? today : date;
    if (origin && destination) {
      onSearch({
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        date: chosenDate,
        passengers,
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-px overflow-hidden rounded-xl border border-white/15 bg-white/5 backdrop-blur-xl sm:flex-row sm:items-stretch"
    >
      {/* From */}
      <div className="flex flex-1 flex-col gap-0.5 border-b border-white/10 px-5 py-4 sm:border-b-0 sm:border-r">
        <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">
          From
        </span>
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
          <input
            placeholder="JFK"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            maxLength={3}
            className="w-full bg-transparent text-lg font-bold uppercase text-white placeholder:text-white/30 focus:outline-none"
          />
        </div>
      </div>

      {/* To */}
      <div className="flex flex-1 flex-col gap-0.5 border-b border-white/10 px-5 py-4 sm:border-b-0 sm:border-r">
        <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">
          To
        </span>
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 shrink-0 rotate-90 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
          <input
            placeholder="BOS"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            maxLength={3}
            className="w-full bg-transparent text-lg font-bold uppercase text-white placeholder:text-white/30 focus:outline-none"
          />
        </div>
      </div>

      {/* Depart */}
      <div className="flex flex-1 flex-col gap-0.5 border-b border-white/10 px-5 py-4 sm:border-b-0 sm:border-r">
        <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">
          Depart
        </span>
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 shrink-0 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <div className="relative">
            <span className="text-lg font-bold text-white">{formatDateLabel(date)}</span>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>
        </div>
      </div>

      {/* Passengers */}
      <div className="flex flex-col gap-0.5 border-b border-white/10 px-5 py-4 sm:w-32 sm:border-b-0 sm:border-r">
        <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">
          Passengers
        </span>
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 shrink-0 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <select
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            className="bg-transparent text-lg font-bold text-white focus:outline-none appearance-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <option key={n} value={n} className="bg-slate-900">
                {n}
              </option>
            ))}
          </select>
          <span className="text-sm text-white/50">Economy</span>
        </div>
      </div>

      {/* Search button */}
      <div className="flex items-center px-4 py-4">
        <button
          type="submit"
          disabled={isLoading || !origin || !destination}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 font-medium text-white shadow-lg transition-colors hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Searching...
            </>
          ) : (
            <>
              Search Flights
              <span aria-hidden="true">&rarr;</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
