import type { PhotonEvent, NotificationContent } from "@/lib/types/photon";
import { renderTemplate } from "./templates";
import { logEvent } from "@/lib/db/queries";

/**
 * Dispatch a Photon event — render the template and deliver via the appropriate channel.
 * In production, this would call spectrum-ts for push/email delivery.
 * Currently logs to DB and console.
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

  // In production: dispatch via spectrum-ts
  // await spectrumClient.send({ channel, userId, subject, body })
  console.log(
    `[Photon] ${notification.channel}:${event.eventType} → ${event.userId}: ${notification.subject}`
  );

  return notification;
}
