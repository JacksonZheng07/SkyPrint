import type { FlightAnalysis } from "../../lib/types";
import { computeISSRMinutes } from "../../lib/compute-issr-minutes";
import { formatFlightMetadata } from "../../lib/format-metadata";
import { FootnoteRef } from "../FootnoteRef";

export function IssrScene({ data }: { data: FlightAnalysis }) {
  const { durationHours } = formatFlightMetadata(data.metadata);
  const issrMinutes = computeISSRMinutes(data.track_actual);
  const weatherSource = data.metadata.data_sources.weather?.source ?? "ERA5";

  return (
    <div className="space-y-4 max-w-md">
      <p className="text-sm sm:text-base text-zinc-200 leading-relaxed">
        For {issrMinutes} minutes of this {durationHours}-hour flight, the aircraft flew through air
        cold and humid enough that its exhaust turned into persistent warming clouds.
      </p>
      <p className="text-xs text-zinc-400 leading-relaxed">
        The colored regions show where conditions were right for contrail formation. Red segments:
        the aircraft was inside them.
        <FootnoteRef
          field="metadata.data_sources.weather"
          source={weatherSource}
          url="https://cds.climate.copernicus.eu/"
          equation={"SAC: G = cp(T−Tmix) / (EI_H₂O·Q·η)\nISSR: q > qsat,ice(T, p)"}
        />
      </p>
    </div>
  );
}
