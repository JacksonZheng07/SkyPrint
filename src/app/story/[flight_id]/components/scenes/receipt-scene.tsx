import type { FlightAnalysis } from "../../lib/types";
import { toCarsPerYear } from "../../lib/conversions";
import { FootnoteRef } from "../FootnoteRef";

export function ReceiptScene({ data }: { data: FlightAnalysis }) {
  const total = data.totals.actual.total_warming_tco2e.value;
  const co2Only = data.totals.actual.co2_fuel_kg.value;
  const multiplier = (total / co2Only).toFixed(1);
  const cars = Math.round(toCarsPerYear(total));

  return (
    <div className="space-y-3 max-w-lg">
      <h2 className="text-xl sm:text-2xl font-semibold text-white">The real warming impact</h2>
      <p className="text-sm text-zinc-300 leading-relaxed">
        This flight&apos;s actual warming impact is{" "}
        <span className="text-white font-semibold font-mono">{multiplier}x</span> what{" "}
        {data.airline_context.carrier_name}&apos;s booking site told passengers.
        <FootnoteRef
          field="totals.actual.total_warming_tco2e"
          source={data.totals.actual.total_warming_tco2e.source}
        />
      </p>
      <p className="text-xs text-zinc-400">
        Equivalent to {cars} cars driven for a year.
        <FootnoteRef
          field="EPA_car_equivalence"
          source="EPA Greenhouse Gas Equivalencies Calculator (4.6 tCO2/car/year)"
          url="https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator"
        />
      </p>
    </div>
  );
}
