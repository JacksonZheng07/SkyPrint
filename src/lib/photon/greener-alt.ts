import type { FlightComparison, FlightComparisonItem } from "@/lib/types/comparison";
import type { GreenerAlternative } from "@/lib/types/photon";

/**
 * Given a flight comparison and the flight the user actually booked,
 * build a GreenerAlternative payload — or return null if they already
 * picked the best option.
 */
export function buildGreenerAlternative(
  comparison: FlightComparison,
  bookedFlightId: string
): GreenerAlternative | null {
  const booked = comparison.flights.find(
    (f) => f.flight.flightId === bookedFlightId
  );
  if (!booked) return null;

  const best = comparison.bestOption;

  // Already booked the greenest flight — nothing to nudge about
  if (best.flight.flightId === bookedFlightId) return null;

  // Only nudge if the difference is meaningful (>10% impact reduction)
  const reductionPct =
    ((booked.totalImpactScore - best.totalImpactScore) /
      booked.totalImpactScore) *
    100;
  if (reductionPct < 10) return null;

  const bookedCo2 = booked.contrail.co2Kg ?? booked.totalImpactScore;
  const altCo2 = best.contrail.co2Kg ?? best.totalImpactScore;

  return {
    bookedAirline: booked.flight.airline,
    bookedFlightNumber: booked.flight.flightNumber,
    bookedPrice: booked.flight.price,
    bookedCo2Kg: bookedCo2,
    bookedImpactScore: booked.totalImpactScore,
    altAirline: best.flight.airline,
    altFlightNumber: best.flight.flightNumber,
    altPrice: best.flight.price,
    altCo2Kg: altCo2,
    altImpactScore: best.totalImpactScore,
    origin: comparison.origin,
    destination: comparison.destination,
    impactReductionPct: reductionPct,
    compareUrl: `/compare/detail?origin=${comparison.origin}&destination=${comparison.destination}&date=${comparison.date}`,
  };
}
