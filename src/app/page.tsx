"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function Home() {
  return (
    <div className="-mt-14 flex flex-1 flex-col">
      {/* ===== HERO ===== */}
      <section
        className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20">
          <div className="max-w-2xl space-y-5">
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl drop-shadow-lg">
              Contrails cause
              <br />
              <span className="text-emerald-400">57%</span> of aviation
              <br />
              warming.
            </h1>
            <p className="max-w-lg text-lg text-white/80">
              91% of airlines still ignore it. SkyPrint holds them accountable
              with transparent scorecards and puts carbon intelligence directly
              into your booking flow.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/compare"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-emerald-600 px-8 font-medium text-white shadow-lg transition-colors hover:bg-emerald-700"
              >
                Book Flights <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link
                href="/playground"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Playground
              </Link>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-4 pt-4 text-sm text-white/70">
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Airline scorecards A&ndash;F
              </span>
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
                Carbon-aware booking
              </span>
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                Contrail simulation
              </span>
            </div>
          </div>
        </div>

        {/* Aero intro bubble */}
        <div className="absolute bottom-24 right-8 z-10 hidden items-center gap-3 lg:flex">
          <div className="rounded-xl bg-slate-900/80 px-4 py-3 text-sm text-white backdrop-blur-sm">
            <p className="font-medium">Meet Aero.</p>
            <p className="text-white/70">Your AI guide to aviation&apos;s real climate impact.</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/AeroImage.png" alt="Aero" className="h-14 w-14 rounded-full" />
        </div>
      </section>

      {/* ===== FROM ALTITUDE TO IMPACT — over Tree.png ===== */}
      <section
        className="relative min-h-screen overflow-hidden bg-cover bg-fixed bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/Tree.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30" />

        <motion.div
          className="relative z-10 px-4 py-28"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <div className="mx-auto max-w-7xl">
            <motion.p variants={fadeUp} className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-400">
              The problem no one talks about
            </motion.p>
            <motion.h2 variants={fadeUp} className="max-w-lg text-3xl font-bold leading-snug text-white sm:text-4xl">
              Aviation is 3.5% of global warming. Contrails are 57% of that.
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 max-w-lg text-white/70">
              The fix is known: slight altitude adjustments on less than 2% of flights
              could eliminate the majority of contrail warming. The software exists.
              Airlines aren&apos;t using it&mdash;because there&apos;s no consumer pressure
              and no accountability. SkyPrint changes that.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="#why-contrails"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Why contrails matter
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Why Contrails — overlaid on same background */}
        <motion.div
          id="why-contrails"
          className="relative z-10 px-4 pb-24 pt-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <div className="mx-auto max-w-5xl">
            <motion.h2 variants={fadeUp} className="mb-14 text-center text-3xl font-bold text-white">
              Why Contrails Matter More Than CO₂
            </motion.h2>
            <motion.div variants={stagger} className="grid gap-6 md:grid-cols-3">
              <FeatureCard
                icon={
                  <svg className="h-7 w-7 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                }
                title="Bigger Than CO₂"
                description="Contrails trap heat that rivals or exceeds direct CO₂ emissions on many routes — yet 91% of airlines do nothing about it."
                stat="Up to 57% of aviation warming"
              />
              <FeatureCard
                icon={
                  <svg className="h-7 w-7 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
                title="The Fix Exists"
                description="Slight altitude adjustments on less than 2% of flights could eliminate the majority of contrail warming. The technology is ready."
                stat="Less than 2% of flights need rerouting"
              />
              <FeatureCard
                icon={
                  <svg className="h-7 w-7 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                }
                title="No Accountability"
                description="Airlines won't act without consumer pressure. SkyPrint scores every airline A through F and puts the data in your hands before you book."
                stat="Transparent scorecards for 120+ airlines"
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ===== HOW SKYPRINT WORKS — over BelowHero.png ===== */}
      <section
        id="how-it-works"
        className="relative min-h-screen overflow-hidden bg-cover bg-fixed bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/BelowHero.png')" }}
      >
        <div className="absolute inset-0 bg-black/60" />

        <motion.div
          className="relative z-10 px-4 py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <div className="mx-auto max-w-5xl">
            <motion.h2 variants={fadeUp} className="mb-14 text-center text-3xl font-bold text-white">
              How SkyPrint Works
            </motion.h2>
            <motion.div variants={stagger} className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
              <StepCard step={1} title="Score airlines" description="Every airline graded A–F on emissions, contrail avoidance, and fuel efficiency." icon="chart" />
              <StepCard step={2} title="Compare flights" description="See CO₂ delta, contrail risk, and climate score side-by-side before you book." icon="search" />
              <StepCard step={3} title="Ask Aero" description="Our AI breaks down the data in plain language so you know exactly what you're choosing." icon="aero" />
              <StepCard step={4} title="Simulate routes" description="Model contrail-optimized alternatives and see the cost-benefit breakdown." icon="check" />
            </motion.div>
          </div>
        </motion.div>

        {/* Flight comparison — overlaid on same background */}
        <motion.div
          className="relative z-10 px-4 pb-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-400">
                  Carbon intelligence in your booking
                </p>
                <h2 className="text-3xl font-bold leading-snug text-white sm:text-4xl">
                  Same route.
                  <br />
                  Different impact.
                </h2>
                <p className="mt-4 text-white/60">
                  For any two flights, see the CO₂ delta, contrail risk, airline
                  scorecard grade, and price difference normalized against the
                  real carbon cost. Not just a number&mdash;a story.
                </p>
                <Link
                  href="/compare"
                  className="mt-6 inline-flex items-center gap-2 font-medium text-emerald-400 hover:text-emerald-300"
                >
                  Try a search <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {/* Flight card 1 — worse choice */}
                <div className="flex-1 rounded-xl border border-red-500/30 bg-white/10 p-4 backdrop-blur-md">
                  <span className="mb-2 inline-block rounded-full bg-red-500/20 px-3 py-0.5 text-[10px] font-semibold text-red-400">
                    High Climate Impact
                  </span>
                  <div className="flex items-center justify-between text-sm text-white">
                    <span className="font-medium">8:20 AM &mdash; 3:45 PM</span>
                    <span className="text-white/60">JFK &rarr; LHR</span>
                  </div>
                  <p className="mt-1 text-xs text-white/50">Direct &middot; 7h 25m</p>
                  <div className="mt-3 flex items-center justify-between text-white">
                    <span className="text-xs text-white/50">Airways X &middot; Grade D</span>
                    <span className="font-semibold">$742</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center text-xs">
                    <div>
                      <p className="text-white/50">Climate Score</p>
                      <p className="mt-1 text-lg font-bold text-red-400">2.1</p>
                    </div>
                    <div>
                      <p className="text-white/50">Contrail Risk</p>
                      <p className="mt-1 text-lg font-bold text-red-400">High</p>
                    </div>
                    <div>
                      <p className="text-white/50">CO₂</p>
                      <p className="mt-1 text-lg font-bold text-red-300">847 kg</p>
                    </div>
                  </div>
                </div>

                {/* Flight card 2 — better choice */}
                <div className="relative flex-1 rounded-xl border-2 border-emerald-500 bg-white/10 p-4 backdrop-blur-md">
                  <span className="absolute -top-3 left-4 rounded-full bg-emerald-600 px-3 py-0.5 text-[10px] font-semibold text-white">
                    Better Overall Climate Choice
                  </span>
                  <div className="flex items-center justify-between text-sm text-white">
                    <span className="font-medium">9:40 AM &mdash; 5:05 PM</span>
                    <span className="text-white/60">JFK &rarr; LHR</span>
                  </div>
                  <p className="mt-1 text-xs text-white/50">Direct &middot; 7h 25m</p>
                  <div className="mt-3 flex items-center justify-between text-white">
                    <span className="text-xs text-white/50">Airways Y &middot; Grade A</span>
                    <span className="font-semibold">$765</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center text-xs">
                    <div>
                      <p className="text-white/50">Climate Score</p>
                      <p className="mt-1 text-lg font-bold text-emerald-400">8.9</p>
                    </div>
                    <div>
                      <p className="text-white/50">Contrail Risk</p>
                      <p className="mt-1 text-lg font-bold text-emerald-400">Low</p>
                    </div>
                    <div>
                      <p className="text-white/50">CO₂</p>
                      <p className="mt-1 text-lg font-bold text-emerald-300">312 kg</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-md bg-emerald-500/15 px-3 py-1.5 text-center text-xs font-medium text-emerald-400">
                    Saves 535 kg CO₂ &mdash; equivalent to 24 trees per year
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== FEATURED STORY ===== */}
      <section className="bg-zinc-950 px-4 py-20">
        <motion.div
          className="mx-auto max-w-5xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">
            Flight Story
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-white mb-10">
            See the science behind one real flight
          </motion.h2>

          <motion.div variants={fadeUp}>
            <Link
              href="/story/BAW117_2026-04-10"
              className="group block rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-emerald-500/40 hover:bg-white/8 transition-all"
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left: flight details */}
                <div className="p-8 space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl font-bold text-white">BA 117</span>
                      <span className="rounded-full bg-emerald-600/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                        Real CoCiP model
                      </span>
                    </div>
                    <p className="text-white/50 text-sm">British Airways · Boeing 777-300ER</p>
                  </div>

                  <div className="flex items-center gap-4 text-white">
                    <div>
                      <p className="text-2xl font-bold">JFK</p>
                      <p className="text-xs text-white/40">New York</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <p className="text-xs text-white/30">6h 50m</p>
                      <div className="w-full h-px bg-white/10 my-1" />
                      <p className="text-xs text-white/30">Apr 10, 2026</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">LHR</p>
                      <p className="text-xs text-white/40">London</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-white/5 px-3 py-2.5">
                      <p className="text-xs text-white/40">Direct CO₂</p>
                      <p className="text-lg font-bold text-white">189 kg</p>
                    </div>
                    <div className="rounded-lg bg-orange-500/10 px-3 py-2.5 border border-orange-500/20">
                      <p className="text-xs text-orange-400/80">Contrail</p>
                      <p className="text-lg font-bold text-orange-300">213 tCO₂e</p>
                    </div>
                    <div className="rounded-lg bg-red-500/10 px-3 py-2.5 border border-red-500/20">
                      <p className="text-xs text-red-400/80">Total warming</p>
                      <p className="text-lg font-bold text-red-300">435 tCO₂e</p>
                    </div>
                  </div>

                  <p className="text-sm text-white/50 leading-relaxed">
                    A small altitude diversion could have cut warming by{" "}
                    <span className="text-emerald-400 font-semibold">43%</span>{" "}
                    at a fuel cost of just 3%.
                  </p>
                </div>

                {/* Right: CTA */}
                <div className="flex flex-col items-center justify-center gap-4 p-8 border-t md:border-t-0 md:border-l border-white/10 text-center">
                  <div className="h-16 w-16 rounded-full bg-emerald-600/15 border border-emerald-500/20 flex items-center justify-center">
                    <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold">See the full flight story</p>
                    <p className="text-white/40 text-sm mt-1">Interactive globe · Contrail map · Scrolling analysis</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white group-hover:bg-emerald-500 transition-colors">
                    Explore BA 117 <span aria-hidden="true">→</span>
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== STATS BAR — over FooterImage.png ===== */}
      <section
        className="relative min-h-screen overflow-hidden bg-cover bg-fixed bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/FooterImage.png')" }}
      >
        <div className="absolute inset-0 bg-slate-900/60" />
        <motion.div
          className="relative z-10 px-4 py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <div className="mx-auto max-w-5xl">
            <motion.div variants={stagger} className="grid gap-8 text-center sm:grid-cols-2 md:grid-cols-4">
              <StatCard
                icon={
                  <svg className="mx-auto h-6 w-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                }
                value="57%"
                label="Of Aviation Warming"
                sublabel="Caused by contrails alone"
              />
              <StatCard
                icon={
                  <svg className="mx-auto h-6 w-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                }
                value="91%"
                label="Airlines Ignoring It"
                sublabel="No contrail avoidance programs"
              />
              <StatCard
                icon={
                  <svg className="mx-auto h-6 w-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                }
                value="<2%"
                label="Flights Need Rerouting"
                sublabel="To eliminate most contrail warming"
              />
              <StatCard
                icon={
                  <svg className="mx-auto h-6 w-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                }
                value="3.5%"
                label="Of Global Warming"
                sublabel="From aviation — and growing"
              />
            </motion.div>
          </div>

          {/* Final CTA — overlaid on same background */}
          <motion.div
            className="mx-auto mt-20 max-w-2xl space-y-4 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-white">
              The industry won&apos;t change itself
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/60">
              Consumer pressure drives corporate action. SkyPrint gives you the
              data to hold airlines accountable&mdash;and the tools to fly smarter
              while you do it.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              <Link
                href="/compare"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-emerald-600 px-8 font-medium text-white shadow-lg transition-colors hover:bg-emerald-700"
              >
                Book Flights <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link
                href="/airlines"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                View Airline Scorecards
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

/* ===== Sub-components ===== */

function FeatureCard({
  icon,
  title,
  description,
  stat,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  stat: string;
}) {
  return (
    <motion.div variants={fadeUp} className="rounded-xl border border-white/10 bg-white/10 p-6 text-center backdrop-blur-md">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        {description}
      </p>
      <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        {stat}
      </p>
    </motion.div>
  );
}

function StepCard({
  step,
  title,
  description,
  icon,
}: {
  step: number;
  title: string;
  description: string;
  icon: string;
}) {
  const icons: Record<string, React.ReactNode> = {
    search: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    chart: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    aero: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
    check: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <motion.div variants={fadeUp} className="flex flex-col items-center text-center">
      <div className="relative mb-4">
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
          {step}
        </span>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-sm">
          {icons[icon]}
        </div>
      </div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-white/60">{description}</p>
    </motion.div>
  );
}

function StatCard({
  icon,
  value,
  label,
  sublabel,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  sublabel: string;
}) {
  return (
    <motion.div variants={fadeUp}>
      {icon}
      <p className="mt-2 text-4xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm font-medium text-white/80">{label}</p>
      <p className="text-xs text-white/50">{sublabel}</p>
    </motion.div>
  );
}
