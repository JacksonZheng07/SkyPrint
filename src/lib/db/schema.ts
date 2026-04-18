import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  real,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const flightBookings = pgTable("flight_bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  flightId: text("flight_id").notNull(),
  airline: text("airline").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  departureTime: timestamp("departure_time").notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),
  co2Kg: real("co2_kg").notNull(),
  contrailImpactScore: real("contrail_impact_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scheduledPhotonEvents = pgTable(
  "scheduled_photon_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").notNull(),
    scheduledFor: timestamp("scheduled_for").notNull(),
    status: text("status").notNull().default("pending"), // pending | sent | failed
    createdAt: timestamp("created_at").defaultNow().notNull(),
    sentAt: timestamp("sent_at"),
  },
  (table) => [
    index("idx_scheduled_status_time").on(table.status, table.scheduledFor),
  ]
);

export const photonEventLog = pgTable("photon_event_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  eventType: text("event_type").notNull(),
  channel: text("channel").notNull(), // push | email | in_app
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  deliveredAt: timestamp("delivered_at").defaultNow().notNull(),
});

export const userStats = pgTable("user_stats", {
  userId: uuid("user_id")
    .references(() => users.id)
    .primaryKey(),
  totalFlights: integer("total_flights").notNull().default(0),
  flightsOptimized: integer("flights_optimized").notNull().default(0),
  totalCo2Kg: real("total_co2_kg").notNull().default(0),
  totalCo2SavedKg: real("total_co2_saved_kg").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
