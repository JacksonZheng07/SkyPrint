import type { FlightAnalysis } from "../../lib/types";
import { toCarsPerYear } from "../../lib/conversions";
import { FootnoteRef } from "../FootnoteRef";

function dominantOffsetFt(offsets: number[]): number {
  const nonZero = offsets.filter((o) => o !== 0);
  if (nonZero.length === 0) return 0;
  return nonZero.reduce((a, b) => a + b, 0) / nonZero.length;
}

export function CounterfactualScene({ data }: { data: FlightAnalysis }) {
  const spec = data.counterfactual_spec;
  const offsetLabel = Math.round(dominantOffsetFt(spec.selected_offset_ft_by_segment));
  const avoidable = data.totals.avoidable_warming_tco2e.value;
  const fuelPenalty = data.totals.fuel_penalty_kg;
  const fuelPct = data.totals.fuel_penalty_pct;
  const carsAvoided = Math.round(toCarsPerYear(avoidable));
  const nOffsets = spec.offsets_evaluated_ft.length;

  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="text-xl sm:text-2xl font-semibold text-white">The route not taken</h2>
      <p className="text-sm text-zinc-300 leading-relaxed">
        A <span className="font-mono text-[#00E5CC]">{offsetLabel} ft</span> altitude change over
        the North Atlantic would have cost{" "}
        <span className="font-mono">{fuelPenalty.toFixed(1)} kg</span> of extra fuel —{" "}
        {fuelPct.toFixed(1)}% more — and avoided{" "}
        <span className="font-mono text-white font-semibold">
          {avoidable.toFixed(1)} tCO₂e
        </span>{" "}
        of warming. That&apos;s equivalent to {carsAvoided} cars off the road for a year. The
        aircraft didn&apos;t make that change.
        <FootnoteRef
          field="totals.avoidable_warming_tco2e"
          source={data.totals.avoidable_warming_tco2e.source}
          equation={"ΔW = RF_baseline − RF_optimal\ntCO₂e via GWP* (Cain et al. 2019)"}
        />
      </p>
      <p className="text-xs text-zinc-500">
        The optimized route was computed under a {spec.fuel_constraint} across {nOffsets} altitude
        offsets evaluated.
        <FootnoteRef field="counterfactual_spec.method" source={spec.method} />
      </p>
    </div>
  );
}
