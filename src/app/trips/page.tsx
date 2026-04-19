"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Trip = {
  id: string;
  airline: string;
  airlineCode: string;
  route: string;
  date: string;
  contrailRisk: "Low" | "Medium" | "High";
  status: "upcoming" | "completed";
  daysAway?: string;
  impactSaved?: string;
};

const DEMO_TRIPS: Trip[] = [
  {
    id: "1",
    airline: "Air Green AG 23",
    airlineCode: "AG",
    route: "JFK → LHR",
    date: "Jun 10, 2025",
    contrailRisk: "Low",
    status: "upcoming",
    daysAway: "in 3 days",
  },
  {
    id: "2",
    airline: "SkyWays SW 22",
    airlineCode: "SW",
    route: "LHR → CDG",
    date: "Jul 2, 2025",
    contrailRisk: "Medium",
    status: "upcoming",
    daysAway: "in 25 days",
  },
  {
    id: "3",
    airline: "Delta DL 101",
    airlineCode: "DL",
    route: "SFO → JFK",
    date: "May 12, 2025",
    contrailRisk: "Low",
    status: "completed",
    impactSaved: "42 kg CO₂",
  },
];

const riskColors: Record<string, string> = {
  Low: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  High: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export default function TripsPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const filtered = DEMO_TRIPS.filter((t) =>
    tab === "upcoming" ? t.status === "upcoming" : t.status === "completed"
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold">My Trips</h1>
        <p className="mt-2 text-muted-foreground">
          Track your upcoming and past flights with climate impact data.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        <button
          onClick={() => setTab("upcoming")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "upcoming"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setTab("past")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "past"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Past
        </button>
      </div>

      {/* Trip cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No {tab} trips yet. Compare flights to book your next trip.
            </CardContent>
          </Card>
        ) : (
          filtered.map((trip) => (
            <Card key={trip.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardContent className="flex items-center gap-4 py-4">
                {/* Airline icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  {trip.airlineCode}
                </div>

                {/* Trip info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{trip.airline}</h3>
                    {trip.status === "completed" && (
                      <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                        Completed
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{trip.route}</span>
                    <span>{trip.date}</span>
                  </div>
                </div>

                {/* Risk + meta */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right text-sm">
                    <span className="text-muted-foreground">Contrail Risk</span>
                    <div>
                      <Badge className={riskColors[trip.contrailRisk]}>
                        {trip.contrailRisk}
                      </Badge>
                    </div>
                  </div>
                  {trip.daysAway && (
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {trip.daysAway}
                    </span>
                  )}
                  {trip.impactSaved && (
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Impact saved</span>
                      <p className="text-sm font-semibold text-emerald-600">{trip.impactSaved}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View all link */}
      {filtered.length > 0 && (
        <div className="text-center">
          <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
            View All Trips
          </button>
        </div>
      )}
    </div>
  );
}
