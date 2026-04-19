"use client";

export type SortKey = "best" | "contrail" | "co2" | "shortest" | "tradeoff";

interface FlightFiltersProps {
  value: SortKey;
  onChange: (key: SortKey) => void;
}

const FILTERS: { key: SortKey; label: string }[] = [
  { key: "best", label: "Best Match" },
  { key: "tradeoff", label: "Best Tradeoff" },
  { key: "contrail", label: "Lowest Contrail" },
  { key: "co2", label: "Lowest CO₂" },
  { key: "shortest", label: "Shortest" },
];

export function FlightFilters({ value, onChange }: FlightFiltersProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1 w-fit">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            value === f.key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
