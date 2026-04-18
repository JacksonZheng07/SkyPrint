"use client";

import { Card, CardContent } from "@/components/ui/card";

// Platform-wide aggregate stats (would come from DB in production)
const PLATFORM_STATS = {
  flightsAnalyzed: 12847,
  contrailsAvoided: 3421,
  co2SavedKg: 287000,
  usersActive: 1893,
  routesOptimized: 856,
  avgImpactReduction: 34,
};

export default function DailyPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-16">
      <div>
        <h1 className="text-3xl font-bold">Daily Impact</h1>
        <p className="mt-2 text-muted-foreground">
          Aggregate platform statistics — flights analyzed, contrails avoided,
          CO2 saved.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          value={PLATFORM_STATS.flightsAnalyzed.toLocaleString()}
          label="Flights Analyzed"
          description="Total flights scored for climate impact"
        />
        <StatCard
          value={PLATFORM_STATS.contrailsAvoided.toLocaleString()}
          label="Contrails Avoided"
          description="Flights where users chose the lower-contrail option"
        />
        <StatCard
          value={`${(PLATFORM_STATS.co2SavedKg / 1000).toFixed(0)}t`}
          label="CO2 Equivalent Saved"
          description="Total emissions avoided through informed choices"
        />
        <StatCard
          value={PLATFORM_STATS.usersActive.toLocaleString()}
          label="Active Users"
          description="People making climate-informed flight decisions"
        />
        <StatCard
          value={PLATFORM_STATS.routesOptimized.toLocaleString()}
          label="Routes Simulated"
          description="Altitude optimization simulations run"
        />
        <StatCard
          value={`${PLATFORM_STATS.avgImpactReduction}%`}
          label="Avg Impact Reduction"
          description="Mean climate impact reduction when choosing the best option"
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold">Today&apos;s Contrail Conditions</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <RegionSummary
              region="North Atlantic"
              risk="high"
              detail="Extensive ice-supersaturated regions at FL350-FL390. Night flights particularly affected."
            />
            <RegionSummary
              region="US Domestic"
              risk="medium"
              detail="Scattered risk areas over the Midwest at FL330-FL370. Morning flights cleaner than evening."
            />
            <RegionSummary
              region="Asia-Pacific"
              risk="low"
              detail="Dry upper atmosphere across most Pacific routes. Low contrail persistence expected."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  value,
  label,
  description,
}: {
  value: string;
  label: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-3xl font-bold text-sky-500">{value}</p>
        <p className="mt-1 font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function RegionSummary({
  region,
  risk,
  detail,
}: {
  region: string;
  risk: "low" | "medium" | "high";
  detail: string;
}) {
  const riskColor =
    risk === "high"
      ? "text-red-500"
      : risk === "medium"
        ? "text-amber-500"
        : "text-green-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{region}</h3>
        <span className={`text-sm font-semibold capitalize ${riskColor}`}>
          {risk}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}
