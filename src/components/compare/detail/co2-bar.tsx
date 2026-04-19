interface Co2BarProps {
  value: number;
  max: number;
  isBetter: boolean;
}

export function Co2Bar({ value, max, isBetter }: Co2BarProps) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-3 rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${
          isBetter ? "bg-emerald-500" : "bg-zinc-400"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
