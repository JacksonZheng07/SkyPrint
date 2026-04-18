import { NextRequest, NextResponse } from "next/server";
import { getDueEvents, markEventSent, markEventFailed } from "@/lib/db/queries";
import { dispatchPhotonEvent } from "@/lib/photon/events";
import type { PhotonEventType, PhotonEventPayload } from "@/lib/types/photon";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const dueEvents = await getDueEvents(now);
  let processed = 0;
  let failed = 0;

  for (const event of dueEvents) {
    try {
      await dispatchPhotonEvent({
        userId: event.userId,
        eventType: event.eventType as PhotonEventType,
        payload: event.payload as PhotonEventPayload,
      });
      await markEventSent(event.id);
      processed++;
    } catch (error) {
      console.error(`[Photon Cron] Failed to process event ${event.id}:`, error);
      await markEventFailed(event.id);
      failed++;
    }
  }

  return NextResponse.json({
    processed,
    failed,
    total: dueEvents.length,
    timestamp: now.toISOString(),
  });
}
