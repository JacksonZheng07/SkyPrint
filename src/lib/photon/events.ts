import type { PhotonEvent, NotificationContent } from "@/lib/types/photon";
import { renderTemplate } from "./templates";
import { sendIMessageWithTyping } from "./spectrum-client";

/**
 * Dispatch a Photon event — render the template and deliver via iMessage.
 * No database dependency — logs to console only.
 */
export async function dispatchPhotonEvent(
  event: PhotonEvent
): Promise<NotificationContent> {
  const notification = renderTemplate(event.eventType, event.payload);

  // Deliver via spectrum-ts iMessage if user has a phone number
  if (event.payload.phoneNumber) {
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
    }
  }

  console.log(
    `[Photon] ${notification.channel}:${event.eventType} → ${event.userId}: ${notification.subject}`
  );

  return notification;
}
