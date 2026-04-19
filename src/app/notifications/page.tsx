"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Notification = {
  id: string;
  type: "post-flight" | "pre-flight" | "monthly";
  title: string;
  body: string;
  date: string;
  read: boolean;
};

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "post-flight",
    title: "Post-Flight Summary",
    body: "You saved 43kg CO₂ on your JFK → LHR flight. That's 2 trees for a year!",
    date: "May 12, 2025 · 10:30 AM",
    read: false,
  },
  {
    id: "2",
    type: "pre-flight",
    title: "Pre-Flight Nudge",
    body: "High contrail risk detected for your upcoming flight to LHR. A cleaner option exists.",
    date: "May 9, 2025 · 8:00 AM",
    read: false,
  },
  {
    id: "3",
    type: "monthly",
    title: "Monthly Impact",
    body: "You've saved 78kg CO₂ this month. Keep flying climate-conscious!",
    date: "May 1, 2025 · 8:00 AM",
    read: true,
  },
];

const typeConfig: Record<string, { icon: string; color: string }> = {
  "post-flight": {
    icon: "✈️",
    color: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
  },
  "pre-flight": {
    icon: "⚠️",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
  monthly: {
    icon: "📊",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
};

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="mt-2 text-muted-foreground">
          Stay informed about your flight impact and climate-smart opportunities.
        </p>
      </div>

      <div className="space-y-3">
        {DEMO_NOTIFICATIONS.map((notif) => {
          const config = typeConfig[notif.type];
          return (
            <Card
              key={notif.id}
              className={`overflow-hidden transition-all hover:shadow-md ${
                !notif.read ? "border-emerald-200 dark:border-emerald-800" : ""
              }`}
            >
              <CardContent className="flex gap-4 py-4">
                {/* Icon */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${config.color}`}
                >
                  {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{notif.title}</h3>
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {notif.body}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">{notif.date}</p>
                </div>

                {/* Type badge */}
                <Badge variant="secondary" className="shrink-0 self-start text-xs">
                  {notif.type === "post-flight"
                    ? "Post-Flight"
                    : notif.type === "pre-flight"
                      ? "Pre-Flight"
                      : "Monthly"}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
          View All Notifications
        </button>
      </div>
    </div>
  );
}
