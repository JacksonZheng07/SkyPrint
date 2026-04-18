import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-widest text-sky-500">
            Clean Aviation Intelligence
          </p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            See the full climate cost
            <br />
            of every flight
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Contrails cause ~35% of aviation&apos;s warming effect — yet
            they&apos;re invisible to passengers. SkyPrint makes this impact
            visible and actionable.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/compare"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Compare Flights
          </Link>
          <Link
            href="/simulate"
            className="inline-flex h-12 items-center justify-center rounded-full border border-border px-8 font-medium transition-colors hover:bg-accent"
          >
            Simulate Route
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/40 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            How SkyPrint Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              step="1"
              title="Search flights"
              description="Enter your route and date. We pull real flight schedules and generate trajectory data for each option."
            />
            <FeatureCard
              step="2"
              title="Analyze climate impact"
              description="Our contrail engine evaluates atmospheric conditions along each route — temperature, humidity, ice supersaturation — to predict contrail formation."
            />
            <FeatureCard
              step="3"
              title="Choose cleaner"
              description="See the total climate impact: CO2 emissions plus contrail radiative forcing. Pick the flight with the lowest combined footprint."
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <StatCard value="35%" label="of aviation warming from contrails" />
            <StatCard value="2-4x" label="more warming than CO2 alone" />
            <StatCard value="60%" label="of contrails are avoidable" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/40 px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl space-y-4">
          <h2 className="text-2xl font-bold">
            Every flight decision matters
          </h2>
          <p className="text-muted-foreground">
            Compare flights by total climate impact — not just carbon — and make
            choices that reduce aviation&apos;s warming footprint.
          </p>
          <Link
            href="/compare"
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start Comparing
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">
        {step}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-4xl font-bold text-sky-500">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
