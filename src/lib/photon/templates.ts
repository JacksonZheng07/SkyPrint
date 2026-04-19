import type { PhotonEventType, PhotonEventPayload, NotificationContent } from "@/lib/types/photon";
import { formatCo2 } from "@/lib/utils/format";
import { co2ToTrees, co2ToCarMiles } from "@/lib/utils/units";

export function renderTemplate(
  eventType: PhotonEventType,
  payload: PhotonEventPayload
): NotificationContent {
  switch (eventType) {
    case "flight_booked":
      return renderFlightBooked(payload);
    case "pre_flight_24h":
      return renderPreFlight(payload);
    case "post_flight":
      return renderPostFlight(payload);
    case "in_flight":
      return renderInFlight();
    case "long_term_stats":
      return renderLongTermStats(payload);
  }
}

function renderFlightBooked(payload: PhotonEventPayload): NotificationContent {
  const co2 = payload.impactSummary?.co2Kg ?? 0;
  const risk = payload.contrailData?.riskRating ?? "medium";

  return {
    subject: "Your flight's climate impact",
    body: [
      `Your upcoming flight will produce approximately ${formatCo2(co2)}.`,
      `Contrail risk: ${risk}. ${risk === "high" ? "Persistent contrails on this route may double the total warming effect." : ""}`,
      payload.impactSummary && payload.impactSummary.co2Saved > 0
        ? `By choosing this flight, you saved ${formatCo2(payload.impactSummary.co2Saved)} compared to the worst option.`
        : "",
    ]
      .filter(Boolean)
      .join(" "),
    channel: "in_app",
  };
}

function renderPreFlight(payload: PhotonEventPayload): NotificationContent {
  const risk = payload.contrailData?.riskRating ?? "medium";

  return {
    subject: "Tomorrow's flight — contrail forecast",
    body:
      risk === "high"
        ? "Weather conditions suggest high contrail persistence on your route tomorrow. If you have flexibility, consider an earlier departure when upper-atmosphere humidity is lower."
        : risk === "medium"
          ? "Moderate contrail risk on your route tomorrow. Current atmospheric conditions show some ice-supersaturated regions at cruise altitude."
          : "Good news — low contrail risk on your route tomorrow. Atmospheric conditions are unfavorable for persistent contrail formation.",
    channel: "push",
  };
}

function renderInFlight(): NotificationContent {
  return {
    subject: "Live contrail conditions",
    body: "Your aircraft is currently cruising through conditions monitored by SkyPrint. We're tracking contrail formation potential in real-time.",
    channel: "in_app",
  };
}

function renderPostFlight(payload: PhotonEventPayload): NotificationContent {
  const co2 = payload.impactSummary?.co2Kg ?? 0;
  const saved = payload.impactSummary?.co2Saved ?? 0;
  const trees = co2ToTrees(co2);

  return {
    subject: "Your flight impact summary",
    body: [
      `Flight complete. Total CO2: ${formatCo2(co2)} — that's ${trees} tree${trees !== 1 ? "s" : ""} absorbing for a year.`,
      saved > 0
        ? `You saved ${formatCo2(saved)} by choosing the lower-impact option. That's ${co2ToCarMiles(saved)} fewer car miles of warming.`
        : "",
      "Your cumulative stats have been updated on your dashboard.",
    ]
      .filter(Boolean)
      .join(" "),
    channel: "push",
  };
}

function renderLongTermStats(payload: PhotonEventPayload): NotificationContent {
  const stats = payload.userStats;
  if (!stats) {
    return {
      subject: "Your weekly climate report",
      body: "Check your SkyPrint dashboard for your cumulative aviation climate impact.",
      channel: "email",
    };
  }

  return {
    subject: "Your weekly climate report",
    body: [
      `This week's summary: ${stats.totalFlights} flights tracked, ${stats.flightsOptimized} optimized.`,
      `Lifetime CO2 saved: ${formatCo2(stats.totalCo2Saved)}.`,
      `You've been a SkyPrint member since ${new Date(stats.memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" })}.`,
    ].join(" "),
    channel: "email",
  };
}
