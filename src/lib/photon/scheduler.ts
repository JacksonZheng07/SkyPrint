import { scheduleEvent } from "@/lib/db/queries";
import type { PhotonEventPayload } from "@/lib/types/photon";

/**
 * Schedule the full lifecycle of Photon events for a flight booking.
 * Called once when a user books a flight.
 *
 * If the booked flight isn't the greenest option and greenerAlt data is
 * present, a "greener_alternative" nudge is sent 5 minutes after booking
 * so it doesn't collide with the immediate booking confirmation.
 */
export async function scheduleFlightLifecycle(
  userId: string,
  bookingData: {
    departureTime: Date;
    arrivalTime: Date;
    payload: PhotonEventPayload;
  }
) {
  const { departureTime, arrivalTime, payload } = bookingData;

  // 1. Immediate: flight_booked
  await scheduleEvent(userId, "flight_booked", payload as Record<string, unknown>, new Date());

  // 2. 5 min after booking: greener_alternative (only if a better option exists)
  if (payload.greenerAlt) {
    const nudgeTime = new Date(Date.now() + 60 * 1000);
    await scheduleEvent(
      userId,
      "greener_alternative",
      payload as Record<string, unknown>,
      nudgeTime
    );
  }

  // 3. 24 hours before departure: pre_flight_24h
  const preFlight = new Date(departureTime.getTime() - 24 * 60 * 60 * 1000);
  if (preFlight > new Date()) {
    await scheduleEvent(
      userId,
      "pre_flight_24h",
      payload as Record<string, unknown>,
      preFlight
    );
  }

  // 4. 2 hours after landing: post_flight
  const postFlight = new Date(arrivalTime.getTime() + 2 * 60 * 60 * 1000);
  await scheduleEvent(
    userId,
    "post_flight",
    payload as Record<string, unknown>,
    postFlight
  );
}
