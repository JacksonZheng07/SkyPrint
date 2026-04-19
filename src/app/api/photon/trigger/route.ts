import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { dispatchPhotonEvent } from "@/lib/photon/events";
import { buildGreenerAlternative } from "@/lib/photon/greener-alt";
import type { PhotonEvent } from "@/lib/types/photon";
import type { FlightComparison } from "@/lib/types/comparison";

const GREENER_ALT_DELAY_MS = 15_000; // 15 seconds

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      action: "trigger" | "schedule";
      event?: PhotonEvent;
      booking?: {
        userId: string;
        departureTime: string;
        arrivalTime: string;
        bookedFlightId?: string;
        comparison?: FlightComparison;
        payload: PhotonEvent["payload"];
      };
    };

    if (body.action === "trigger" && body.event) {
      const notification = await dispatchPhotonEvent(body.event);
      return NextResponse.json({ success: true, notification });
    }

    if (body.action === "schedule" && body.booking) {
      const { userId, payload, bookedFlightId, comparison } = body.booking;

      // Build greener alternative if comparison data is provided
      if (comparison && bookedFlightId && !payload.greenerAlt) {
        const greenerAlt = buildGreenerAlternative(comparison, bookedFlightId);
        if (greenerAlt) {
          payload.greenerAlt = greenerAlt;
        }
      }

      // Immediately dispatch booking confirmation
      const notification = await dispatchPhotonEvent({
        userId,
        eventType: "flight_booked",
        payload,
      });

      // Schedule greener alternative nudge after delay (runs after response is sent)
      if (payload.greenerAlt) {
        after(async () => {
          await new Promise((r) => setTimeout(r, GREENER_ALT_DELAY_MS));
          await dispatchPhotonEvent({
            userId,
            eventType: "greener_alternative",
            payload,
          });
          console.log(`[Photon] greener_alternative dispatched after ${GREENER_ALT_DELAY_MS / 1000}s delay`);
        });
      }

      return NextResponse.json({
        success: true,
        notification,
        greenerAltIncluded: !!payload.greenerAlt,
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'trigger' or 'schedule'." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Photon trigger error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process event",
      },
      { status: 500 }
    );
  }
}
