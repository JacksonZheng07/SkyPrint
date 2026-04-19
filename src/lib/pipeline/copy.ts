import type { FlightComparisonItem } from "@/lib/types/comparison";

export type ConfidenceLevel = "high" | "medium" | "low";

export function inferConfidence(item: FlightComparisonItem): ConfidenceLevel {
  if (item.contrail.usedFallback) return "low";
  if (item.metrics.riskRating === "high" && item.metrics.impactScore > 70) return "high";
  return "medium";
}

export function generateImpactCopy(
  item: FlightComparisonItem,
  bestItem: FlightComparisonItem,
  worstItem: FlightComparisonItem,
  confidence: ConfidenceLevel
): string {
  if (item.rank === 1) {
    const spread = worstItem.totalImpactScore / item.totalImpactScore;
    if (spread >= 2.0) {
      return `Today's lowest-impact option. The worst alternative creates an estimated ${spread.toFixed(1)}x more warming.`;
    }
    if (spread >= 1.3) {
      const pct = Math.round((spread - 1) * 100);
      return `Lowest-impact option on this route — ${pct}% less estimated warming than the worst alternative shown.`;
    }
    return "Best available option for this route — lowest combined warming impact.";
  }

  const ratio = item.totalImpactScore / bestItem.totalImpactScore;
  const hasPrices =
    typeof item.flight.price === "number" &&
    typeof bestItem.flight.price === "number";
  const priceDelta = hasPrices ? item.flight.price! - bestItem.flight.price! : null;
  const isContrail = item.metrics.riskRating === "high";
  const depHour = new Date(item.flight.departureTime).getUTCHours();
  const isMorning = depHour >= 5 && depHour <= 10;

  // Hedge qualifier for low confidence
  const hedged = confidence === "low";
  const likely = hedged ? "likely " : "";

  // Within 10% of best
  if (ratio < 1.1) {
    if (priceDelta !== null && priceDelta < -15) {
      return `$${Math.abs(priceDelta)} cheaper — warming impact is comparable to the lowest-impact option.`;
    }
    return "Comparable warming impact to the best available option.";
  }

  // 10–40% above best
  if (ratio < 1.4) {
    const pct = Math.round((ratio - 1) * 100);
    if (priceDelta !== null && priceDelta < -20) {
      const qualifier = hedged ? " (estimated)" : "";
      return `$${Math.abs(priceDelta)} cheaper than the best option, but warming impact is ${pct}% higher${qualifier}.`;
    }
    if (isContrail) {
      return `${capitalize(likely)}Higher warming — flight path or timing may encounter contrail-forming conditions.`;
    }
    if (hedged) {
      return `Warming impact is estimated to be slightly higher than the best available option.`;
    }
    return "Slightly higher warming impact than the best available option.";
  }

  // 40–100% above best
  if (ratio < 2.0) {
    if (priceDelta !== null && priceDelta < 0) {
      const qualifier = hedged ? " (estimated)" : "";
      return `You'd save $${Math.abs(priceDelta)} with this flight, but warming impact is substantially higher${qualifier}.`;
    }
    if (isMorning && isContrail) {
      const qualifier = hedged ? " (estimated)" : "";
      return `Morning flights through humid upper airspace tend to form more persistent contrails — this one is significantly higher impact${qualifier}.`;
    }
    if (isContrail) {
      return `This flight is ${likely}significantly more climate-damaging — conditions are ${likely}contrail-sensitive.`;
    }
    if (hedged) {
      return "Warming impact is estimated to be significantly higher than the best alternative on this route.";
    }
    return "This option is significantly higher impact than the best alternative on this route.";
  }

  // 2x or more
  const ratioStr = ratio.toFixed(1);
  if (hedged) {
    return `Estimated to cause roughly ${ratioStr}x more warming than the lowest-impact option — confidence is limited for this route.`;
  }
  if (priceDelta !== null && priceDelta < -25) {
    return `$${Math.abs(priceDelta)} cheaper, but this flight is estimated to cause ${ratioStr}x the warming of the best option.`;
  }
  if (priceDelta !== null && priceDelta > 25) {
    return `More expensive and higher impact. Estimated ${ratioStr}x the warming of the lowest-impact alternative.`;
  }
  return `This flight is estimated to cause ${ratioStr}x the warming of the lowest-impact alternative.`;
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}
