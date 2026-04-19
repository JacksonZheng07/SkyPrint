interface RFBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

export function RFBar({ label, value, maxValue, color }: RFBarProps) {
  const pct = maxValue > 0 ? Math.abs(value / maxValue) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">{value.toFixed(4)} W/m²</span>
      </div>
      <div className="h-3 w-full rounded-full bg-muted">
        <div
          className={`h-3 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}
