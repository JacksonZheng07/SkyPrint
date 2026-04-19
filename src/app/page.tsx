import Link from "next/link";

export default function Home() {
  return (
    <div className="-mt-14 flex flex-1 flex-col">
      {/* Hero — image background with text overlay */}
      <section
        className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      >
        {/* Dark overlay on the left for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        {/* Bottom fade to page background */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20">
          <div className="max-w-2xl space-y-5">
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl drop-shadow-lg">
              Fly cleaner.
              <br />
              Leave lighter
              <br />
              trails.
            </h1>
            <p className="max-w-lg text-lg text-white/80">
              SkyPrint reveals the hidden climate impact of your
              flight&mdash;contrails first.
            </p>
            <div className="flex gap-4 pt-2">
              <Link
                href="/compare"
                className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-600 px-8 font-medium text-white transition-colors hover:bg-emerald-700 shadow-lg"
              >
                Compare Flights
              </Link>
              <Link
                href="/airlines"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Explore Airlines
              </Link>
              <Link
                href="/story/BAW117_2026-04-10"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Explore a Flight
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Contrails Matter More */}
      <section className="border-t bg-muted/40 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Why Contrails Matter More
          </h2>
          <div className="grid gap-10 md:grid-cols-3">
            <FeatureCard
              icon={
                <svg className="h-8 w-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              }
              title="Higher Impact"
              description="Contrails can trap heat 2x more than CO₂"
            />
            <FeatureCard
              icon={
                <svg className="h-8 w-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              title="Hidden Impact"
              description="They depend on weather & altitude"
            />
            <FeatureCard
              icon={
                <svg className="h-8 w-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              }
              title="Smart Choices"
              description="Small changes, big climate difference"
            />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 text-center sm:grid-cols-2 md:grid-cols-4">
            <StatCard value="1.2M+" label="Flights Analyzed" />
            <StatCard value="320K t" label="CO₂ Avoided" />
            <StatCard value="56K" label="Users" />
            <StatCard value="120+" label="Airlines Scored" />
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
            className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-600 px-6 font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Start Comparing
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 dark:bg-sky-950">
        {icon}
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
      <p className="text-4xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
