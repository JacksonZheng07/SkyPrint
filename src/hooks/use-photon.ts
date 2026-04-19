"use client";

import { useCallback, useState } from "react";
import type { PhotonEvent, NotificationContent } from "@/lib/types/photon";
import type { FlightComparison } from "@/lib/types/comparison";

export function usePhoton() {
  const [lastNotification, setLastNotification] =
    useState<NotificationContent | null>(null);
  const [greenerAltIncluded, setGreenerAltIncluded] = useState(false);

  const triggerEvent = useCallback(async (event: PhotonEvent) => {
    const res = await fetch("/api/photon/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "trigger", event }),
    });
    if (!res.ok) throw new Error("Failed to trigger event");
    const data = await res.json();
    setLastNotification(data.notification);
    return data.notification as NotificationContent;
  }, []);

  const scheduleBooking = useCallback(
    async (booking: {
      userId: string;
      departureTime: string;
      arrivalTime: string;
      bookedFlightId?: string;
      comparison?: FlightComparison;
      payload: PhotonEvent["payload"];
    }) => {
      const res = await fetch("/api/photon/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "schedule", booking }),
      });
      if (!res.ok) throw new Error("Failed to schedule events");
      const data = await res.json();
      setGreenerAltIncluded(data.greenerAltIncluded ?? false);
    },
    []
  );

  return { triggerEvent, scheduleBooking, lastNotification, greenerAltIncluded };
}
