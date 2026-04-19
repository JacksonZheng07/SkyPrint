"use client";

import { Card, CardContent } from "@/components/ui/card";

const IMPACT_DATA = {
  co2Saved: 312,
  flights: 16,
  treesEquivalent: 2.4,
  monthly: [
    { month: "Jan", value: 40 },
    { month: "Feb", value: 65 },
    { month: "Mar", value: 80 },
    { month: "Apr", value: 120 },
    { month: "May", value: 200 },
    { month: "Jun", value: 280 },
  ],
  topContributions: [
    { label: "Optimized Routes", value: "182 kg" },
    { label: "Lower Contrail Flights", value: "96 kg" },
    { label: "Efficient Airlines", value: "34 kg" },
  ],
};

const MAX_BAR_VALUE = 300;

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Impact</h1>
          <p className="mt-1 text-muted-foreground">
            Track your personal contribution to cleaner aviation.
          </p>
        </div>
        <select className="rounded-md border border-border bg-background px-3 py-1.5 text-sm">
          <option>This Year</option>
          <option>All Time</option>
          <option>Last 6 Months</option>
        </select>
      </div>

      {/* Big stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-emerald-600">
              {IMPACT_DATA.co2Saved}{" "}
              <span className="text-lg font-normal text-muted-foreground">kg</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">CO₂ Saved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-sky-600">{IMPACT_DATA.flights}</p>
            <p className="mt-1 text-sm text-muted-foreground">Flights</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-green-600">{IMPACT_DATA.treesEquivalent}</p>
            <p className="mt-1 text-sm text-muted-foreground">Trees Equivalent</p>
          </CardContent>
        </Card>
      </div>

      {/* Impact Over Time chart */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-6 text-lg font-semibold">Impact Over Time</h2>
          <div className="flex items-end gap-3 h-48">
            {IMPACT_DATA.monthly.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">{m.value}</span>
                <div className="w-full flex items-end" style={{ height: "160px" }}>
                  <div
                    className="w-full rounded-t-md bg-emerald-500 transition-all"
                    style={{
                      height: `${(m.value / MAX_BAR_VALUE) * 100}%`,
                      minHeight: "4px",
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{m.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Contributions */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold">Top Contributions</h2>
          <div className="space-y-4">
            {IMPACT_DATA.topContributions.map((item, i) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-emerald-600">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
