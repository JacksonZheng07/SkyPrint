import type { FlightAnalysis } from "../../lib/types";
import { FootnoteRef } from "../FootnoteRef";

const MIN_SAMPLE_SIZE = 30;

export function ContextScene({ data }: { data: FlightAnalysis }) {
  const ctx = data.airline_context;
  if (ctx.flights_analyzed < MIN_SAMPLE_SIZE) return <InsufficientSample ctx={ctx} />;
  return <RankedContext ctx={ctx} />;
}

function InsufficientSample({ ctx }: { ctx: FlightAnalysis["airline_context"] }) {
  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="text-xl font-semibold text-white">How we would rank airlines at scale</h2>
      <p className="text-sm text-zinc-300">
        Our prototype covers {ctx.flights_analyzed} flights across {ctx.total_carriers} carriers.
        Statistical ranking requires n ≥ {MIN_SAMPLE_SIZE} per carrier. The methodology is validated
        on the flight above; the scaled version requires longer retrospective windows.
      </p>
    </div>
  );
}

function RankedContext({ ctx }: { ctx: FlightAnalysis["airline_context"] }) {
  return (
    <div className="space-y-3 max-w-lg">
      <h2 className="text-xl sm:text-2xl font-semibold text-white">Airline context</h2>
      <p className="text-sm text-zinc-300 leading-relaxed">
        {ctx.carrier_name} ranks{" "}
        <span className="font-mono text-white font-semibold">{ctx.rank}</span> of {ctx.total_carriers}{" "}
        airlines on avoidable contrail warming.
        <FootnoteRef field="airline_context.rank" source="Pipeline aggregate ranking" />
      </p>
      <p className="text-xs text-zinc-500">
        This metric, scaled industry-wide, becomes an accountability framework for regulators and
        airline procurement teams. Our prototype covers {ctx.flights_analyzed} flights on the North
        Atlantic.
      </p>
    </div>
  );
}
