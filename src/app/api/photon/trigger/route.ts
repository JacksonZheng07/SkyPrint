import { NextRequest, NextResponse } from "next/server";
import { dispatchPhotonEvent } from "@/lib/photon/events";
import { scheduleFlightLifecycle } from "@/lib/photon/scheduler";
import type { PhotonEvent } from "@/lib/types/photon";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      action: "trigger" | "schedule";
      event?: PhotonEvent;
      booking?: {
        userId: string;
        departureTime: string;
        arrivalTime: string;
        payload: PhotonEvent["payload"];
      };
    };

    if (body.action === "trigger" && body.event) {
      const notification = await dispatchPhotonEvent(body.event);
      return NextResponse.json({ success: true, notification });
    }

    if (body.action === "schedule" && body.booking) {
      const { userId, departureTime, arrivalTime, payload } = body.booking;
      await scheduleFlightLifecycle(userId, {
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime),
        payload,
      });
      return NextResponse.json({ success: true, scheduled: true });
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
