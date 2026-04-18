import type { PhotonEvent, NotificationContent } from "@/lib/types/photon";
import { renderTemplate } from "./templates";
import { logEvent } from "@/lib/db/queries";
import { sendIMessageWithTyping } from "./spectrum-client";

/**
 * Dispatch a Photon event — render the template and deliver via the appropriate channel.
 * Uses spectrum-ts for iMessage/push delivery, falls back to logging.
 */
export async function dispatchPhotonEvent(
  event: PhotonEvent
): Promise<NotificationContent> {
  const notification = renderTemplate(event.eventType, event.payload);

  // Log the event delivery
  await logEvent(
    event.userId,
    event.eventType,
    notification.channel,
    notification.subject,
    notification.body
  );

  // Deliver via spectrum-ts iMessage if user has a phone number
  if (event.payload.phoneNumber && (notification.channel === "push" || notification.channel === "in_app")) {
    try {
      await sendIMessageWithTyping(
        event.payload.phoneNumber,
        notification.subject,
        notification.body
      );
      console.log(
        `[Photon] iMessage delivered: ${event.eventType} → ${event.userId}`
      );
    } catch (err) {
      console.error(`[Photon] iMessage delivery failed:`, err);
      // Fall through to console logging
    }
  }

  console.log(
    `[Photon] ${notification.channel}:${event.eventType} → ${event.userId}: ${notification.subject}`
  );

  return notification;
}
