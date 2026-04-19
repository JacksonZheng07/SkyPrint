"use client";

export type SortKey = "best" | "contrail" | "co2" | "shortest" | "tradeoff";

interface FlightFiltersProps {
  value: SortKey;
  onChange: (key: SortKey) => void;
}

const FILTERS: { key: SortKey; label: string }[] = [
  { key: "best", label: "Best Match" },
  { key: "tradeoff", label: "Best Tradeoff" },
  { key: "co2", label: "Lowest CO₂" },
  { key: "contrail", label: "Lowest Contrail" },
  { key: "shortest", label: "Shortest" },
];

export function FlightFilters({ value, onChange }: FlightFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            value === f.key
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
              : "border border-white/20 bg-white/5 text-white/70 backdrop-blur-sm hover:bg-white/10 hover:text-white"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
