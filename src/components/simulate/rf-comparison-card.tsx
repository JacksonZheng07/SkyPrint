import { Card, CardContent } from "@/components/ui/card";
import { RFBar } from "./rf-bar";

interface RfComparisonCardProps {
  baselineRf: number;
  optimizedRf: number;
}

export function RfComparisonCard({ baselineRf, optimizedRf }: RfComparisonCardProps) {
  const maxValue = Math.max(Math.abs(baselineRf), Math.abs(optimizedRf), 0.001);
  const rfReduced = baselineRf - optimizedRf;
  const reductionPct = baselineRf !== 0 ? (rfReduced / baselineRf) * 100 : 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="mb-4 text-lg font-semibold">Radiative Forcing Comparison</h3>
        <div className="space-y-3">
          <RFBar label="Baseline" value={baselineRf} maxValue={maxValue} color="bg-red-500" />
          <RFBar label="Optimized" value={optimizedRf} maxValue={maxValue} color="bg-green-500" />
        </div>
        {rfReduced > 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            Net RF reduced by {reductionPct.toFixed(0)}% — equivalent to removing the warming effect
            of contrails for this route.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
