import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, lte } from "drizzle-orm";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

export async function getDueEvents(now: Date) {
  return db
    .select()
    .from(schema.scheduledPhotonEvents)
    .where(
      and(
        eq(schema.scheduledPhotonEvents.status, "pending"),
        lte(schema.scheduledPhotonEvents.scheduledFor, now)
      )
    )
    .limit(100);
}

export async function markEventSent(eventId: string) {
  return db
    .update(schema.scheduledPhotonEvents)
    .set({ status: "sent", sentAt: new Date() })
    .where(eq(schema.scheduledPhotonEvents.id, eventId));
}

export async function markEventFailed(eventId: string) {
  return db
    .update(schema.scheduledPhotonEvents)
    .set({ status: "failed" })
    .where(eq(schema.scheduledPhotonEvents.id, eventId));
}

export async function scheduleEvent(
  userId: string,
  eventType: string,
  payload: Record<string, unknown>,
  scheduledFor: Date
) {
  return db
    .insert(schema.scheduledPhotonEvents)
    .values({ userId, eventType, payload, scheduledFor })
    .returning();
}

export async function logEvent(
  userId: string,
  eventType: string,
  channel: string,
  subject: string,
  body: string
) {
  return db
    .insert(schema.photonEventLog)
    .values({ userId, eventType, channel, subject, body });
}
