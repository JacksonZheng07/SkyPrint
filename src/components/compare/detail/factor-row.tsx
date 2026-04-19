interface FactorRowProps {
  label: string;
  valueA: string;
  valueB: string;
}

export function FactorRow({ label, valueA, valueB }: FactorRowProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
      <p className="text-right text-sm font-medium">{valueA}</p>
      <p className="text-xs text-muted-foreground text-center min-w-[100px]">{label}</p>
      <p className="text-sm font-medium">{valueB}</p>
    </div>
  );
}
