import Link from "next/link";
import { NewsletterForm } from "./components/NewsletterForm";

export default function MissionPage() {
  return (
    <div className="min-h-screen bg-[#050a14] text-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-28 pb-16">
        {/* Atmosphere glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 70% 30%, rgba(45,212,191,0.06) 0%, transparent 60%),
              radial-gradient(ellipse 60% 80% at 10% 60%, rgba(16,185,129,0.05) 0%, transparent 55%)
            `,
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <h1 className="text-6xl font-extrabold leading-none tracking-tight text-white">
                Our Mission
              </h1>
              <p className="text-xl leading-relaxed text-white/70">
                Making aviation&apos;s hidden climate impact{" "}
                <span className="font-semibold text-teal-400">visible</span> and{" "}
                <span className="font-semibold text-teal-400">actionable.</span>
              </p>

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  {
                    icon: (
                      <svg className="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                      </svg>
                    ),
                    value: "~35%",
                    label: "of aviation's total climate warming",
                  },
                  {
                    icon: (
                      <svg className="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                      </svg>
                    ),
                    value: "2–4x",
                    label: "contrail impact vs CO₂ alone",
                  },
                  {
                    icon: (
                      <svg className="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                      </svg>
                    ),
                    value: "",
                    label: "Smarter routes. Lower impact. Cleaner skies.",
                    mission: true,
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/10 p-4 backdrop-blur-sm"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    {s.icon}
                    {s.value && (
                      <p className="mt-2 text-2xl font-bold text-teal-300">{s.value}</p>
                    )}
                    <p className="mt-1 text-[11px] leading-snug text-white/50">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Plane illustration placeholder */}
            <div className="relative hidden lg:block">
              <div
                className="relative h-72 w-full overflow-hidden rounded-2xl border border-white/10"
                style={{
                  background: "linear-gradient(135deg, rgba(15,30,60,0.8) 0%, rgba(5,15,35,0.95) 100%)",
                  boxShadow: "0 0 80px rgba(45,212,191,0.08)",
                }}
              >
                {/* Abstract contrail streaks */}
                <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 500 300" fill="none">
                  <path d="M-20 200 Q150 80 520 120" stroke="rgba(45,212,191,0.6)" strokeWidth="1.5" strokeDasharray="6 4" />
                  <path d="M-20 220 Q150 100 520 140" stroke="rgba(45,212,191,0.3)" strokeWidth="1" strokeDasharray="6 4" />
                  <path d="M-20 240 Q150 120 520 160" stroke="rgba(45,212,191,0.2)" strokeWidth="1" strokeDasharray="6 4" />
                  <circle cx="420" cy="115" r="4" fill="rgba(45,212,191,0.8)" />
                  <circle cx="420" cy="135" r="2.5" fill="rgba(45,212,191,0.5)" />
                  <circle cx="420" cy="155" r="2" fill="rgba(45,212,191,0.3)" />
                </svg>
                {/* Globe arc */}
                <svg className="absolute bottom-0 left-0 right-0 opacity-20" viewBox="0 0 500 160" fill="none">
                  <ellipse cx="250" cy="200" rx="360" ry="180" stroke="rgba(45,212,191,0.5)" strokeWidth="1" />
                  <ellipse cx="250" cy="200" rx="300" ry="150" stroke="rgba(45,212,191,0.3)" strokeWidth="0.5" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="mx-auto h-16 w-16 text-teal-400 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                    <p className="mt-3 text-sm font-medium text-teal-400/60 tracking-widest uppercase">Clean Skies Initiative</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Invisible Problem ── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left: text */}
            <div
              className="rounded-2xl border border-white/10 p-8 backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <h2 className="text-2xl font-bold text-white">The Invisible Problem</h2>
              <p className="mt-4 leading-relaxed text-white/60 text-sm">
                When you book a flight, you might see a carbon offset option.
                But CO₂ is only part of the story.
              </p>
              <p className="mt-3 leading-relaxed text-white/60 text-sm">
                Condensation trails — contrails — form when hot, humid engine exhaust meets cold air
                at cruise altitude. In the right atmospheric conditions, these thin ice-crystal clouds
                persist for hours, trapping outgoing heat radiation like a blanket.
              </p>
              <p className="mt-3 leading-relaxed text-white/60 text-sm">
                Research from institutions including MIT, DLR, and Imperial College London estimates
                that contrails cause approximately <span className="text-teal-400 font-medium">35%</span> of
                aviation&apos;s total climate warming effect. For some flights, the contrail impact
                alone can be <span className="text-teal-400 font-medium">2–4x greater</span> than the CO₂ emitted.
              </p>
              <Link
                href="/simulate"
                className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-teal-400/40 hover:text-teal-300"
              >
                See the Science Behind It
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            {/* Right: How Contrails Warm the Planet diagram */}
            <div
              className="rounded-2xl border border-white/10 p-8 backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <h3 className="text-lg font-semibold text-white/90">How Contrails Warm the Planet</h3>
              <div className="mt-6 flex items-end justify-between gap-4">
                {/* Steps */}
                {[
                  { num: "1", label: "Hot, humid exhaust" },
                  { num: "2", label: "Mixing with cold air" },
                  { num: "3", label: "Ice crystals form contrails" },
                ].map((step, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-teal-400/30 text-xs font-bold text-teal-300"
                      style={{ background: "rgba(45,212,191,0.1)" }}
                    >
                      {step.num}
                    </div>
                    <p className="text-center text-[11px] text-white/50 leading-snug">{step.label}</p>
                    {i < 2 && (
                      <svg className="absolute hidden" />
                    )}
                  </div>
                ))}
              </div>

              {/* Radiation diagram */}
              <div className="mt-8 rounded-xl border border-white/8 p-4" style={{ background: "rgba(0,0,0,0.2)" }}>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-0.5 w-8 bg-teal-400/60" style={{ backgroundImage: "repeating-linear-gradient(90deg,rgba(45,212,191,0.7) 0,rgba(45,212,191,0.7) 4px,transparent 4px,transparent 8px)" }} />
                      <span className="text-[11px] text-teal-300">Outgoing heat trapped</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-0.5 w-8" style={{ backgroundImage: "repeating-linear-gradient(90deg,rgba(251,191,36,0.7) 0,rgba(251,191,36,0.7) 4px,transparent 4px,transparent 8px)" }} />
                      <span className="text-[11px] text-amber-300">Warming effect (especially at night)</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="h-0.5 w-8 bg-sky-400/60" style={{ backgroundImage: "repeating-linear-gradient(90deg,rgba(56,189,248,0.7) 0,rgba(56,189,248,0.7) 4px,transparent 4px,transparent 8px)" }} />
                      <span className="text-[11px] text-sky-300">Incoming solar radiation reflected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-0.5 w-8 bg-blue-400/40" style={{ backgroundImage: "repeating-linear-gradient(90deg,rgba(96,165,250,0.5) 0,rgba(96,165,250,0.5) 4px,transparent 4px,transparent 8px)" }} />
                      <span className="text-[11px] text-blue-300/70">Cooling effect (daytime only)</span>
                    </div>
                  </div>
                  <svg className="h-24 w-24 shrink-0 opacity-40" viewBox="0 0 100 100" fill="none">
                    <ellipse cx="50" cy="80" rx="45" ry="15" stroke="rgba(45,212,191,0.5)" strokeWidth="1" />
                    <line x1="50" y1="60" x2="50" y2="10" stroke="rgba(251,191,36,0.6)" strokeWidth="1.5" markerEnd="url(#arr)" />
                    <line x1="35" y1="15" x2="35" y2="55" stroke="rgba(56,189,248,0.6)" strokeWidth="1.5" />
                    <line x1="65" y1="15" x2="65" y2="55" stroke="rgba(96,165,250,0.4)" strokeWidth="1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Science ── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold text-white">The Science</h2>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* SAC */}
            <div
              className="rounded-2xl border border-white/10 p-8 backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-teal-400/20"
                  style={{ background: "rgba(45,212,191,0.1)", boxShadow: "0 0 20px rgba(45,212,191,0.1)" }}
                >
                  <svg className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Schmidt-Appleman Criterion (SAC)</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">
                    Contrails form when the mixing of hot exhaust with ambient air passes through liquid
                    water saturation. The SAC predicts whether this threshold is crossed based on
                    temperature, pressure, and humidity at cruise altitude. If the surrounding air is
                    also ice-supersaturated, the contrail persists.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2">
                {[
                  { label: "Inputs", sub: "Temperature\nPressure\nHumidity" },
                  { label: "Predicts", sub: "Contrail\nFormation" },
                  { label: "Outcome", sub: "Persistent\nContrail" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="text-center">
                      <div
                        className="rounded-lg border border-white/10 px-3 py-2 text-center"
                        style={{ background: "rgba(45,212,191,0.06)" }}
                      >
                        <p className="text-[10px] font-semibold text-teal-300">{step.label}</p>
                        <p className="mt-0.5 whitespace-pre text-[9px] text-white/40 leading-snug">{step.sub}</p>
                      </div>
                    </div>
                    {i < 2 && (
                      <svg className="h-3 w-3 shrink-0 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CoCiP */}
            <div
              className="rounded-2xl border border-white/10 p-8 backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-teal-400/20"
                  style={{ background: "rgba(45,212,191,0.1)", boxShadow: "0 0 20px rgba(45,212,191,0.1)" }}
                >
                  <svg className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">CoCiP (Contrail Cirrus Prediction)</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">
                    Developed by DLR and extended by Breakthrough Energy, CoCiP models the full
                    lifecycle of a contrail — formation, spreading, and dissipation — computing the
                    net energy forcing (warming or cooling) over its lifetime. SkyPrint uses CoCiP
                    via the open-source PyContrails library.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2">
                {[
                  { label: "Models", sub: "Lifecycle" },
                  { label: "Computes", sub: "Energy Forcing\n(W/m²)" },
                  { label: "Outputs", sub: "Net Warming\nor Cooling" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="rounded-lg border border-white/10 px-3 py-2 text-center"
                      style={{ background: "rgba(45,212,191,0.06)" }}
                    >
                      <p className="text-[10px] font-semibold text-teal-300">{step.label}</p>
                      <p className="mt-0.5 whitespace-pre text-[9px] text-white/40 leading-snug">{step.sub}</p>
                    </div>
                    {i < 2 && (
                      <svg className="h-3 w-3 shrink-0 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Radiative Forcing — full width */}
          <div
            className="mt-6 rounded-2xl border border-white/10 p-8 backdrop-blur-sm"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div>
                <h3 className="text-xl font-bold text-white">Radiative Forcing</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  Contrails interact with both incoming solar radiation (cooling effect during daytime)
                  and outgoing thermal radiation (warming effect at all times). At night, the net effect
                  is almost always warming.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  SkyPrint calculates the energy forcing in Watts per square meter (W/m²) for each
                  flight segment.
                </p>
              </div>
              {/* RF diagram */}
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-sm">
                  <svg viewBox="0 0 400 200" fill="none" className="w-full">
                    {/* Sun */}
                    <circle cx="80" cy="100" r="28" fill="rgba(251,191,36,0.15)" stroke="rgba(251,191,36,0.4)" strokeWidth="1.5" />
                    <circle cx="80" cy="100" r="18" fill="rgba(251,191,36,0.25)" />
                    {/* Solar rays going right (cooling) */}
                    <line x1="115" y1="85" x2="200" y2="70" stroke="rgba(56,189,248,0.7)" strokeWidth="1.5" strokeDasharray="4 3" />
                    <line x1="115" y1="100" x2="200" y2="95" stroke="rgba(56,189,248,0.7)" strokeWidth="1.5" strokeDasharray="4 3" />
                    <line x1="115" y1="115" x2="200" y2="120" stroke="rgba(56,189,248,0.5)" strokeWidth="1" strokeDasharray="4 3" />
                    {/* Thermal rays going up (warming) */}
                    <line x1="250" y1="160" x2="250" y2="60" stroke="rgba(251,113,33,0.8)" strokeWidth="1.5" />
                    <line x1="270" y1="160" x2="270" y2="60" stroke="rgba(251,113,33,0.7)" strokeWidth="1.5" />
                    <line x1="290" y1="160" x2="290" y2="60" stroke="rgba(251,113,33,0.6)" strokeWidth="1" />
                    <line x1="310" y1="160" x2="310" y2="60" stroke="rgba(251,113,33,0.5)" strokeWidth="1" />
                    {/* Earth arc */}
                    <ellipse cx="200" cy="190" rx="200" ry="50" stroke="rgba(45,212,191,0.3)" strokeWidth="1" />
                    {/* Labels */}
                    <text x="120" y="58" fontSize="9" fill="rgba(56,189,248,0.8)">Solar (shortwave)</text>
                    <text x="120" y="69" fontSize="9" fill="rgba(56,189,248,0.6)">Reflection · Cooling</text>
                    <text x="245" y="48" fontSize="9" fill="rgba(251,113,33,0.9)">Thermal (longwave)</text>
                    <text x="248" y="58" fontSize="9" fill="rgba(251,113,33,0.7)">Emission · Warming</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What You Can Do ── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Left: text block */}
            <div className="lg:col-span-1">
              <h2 className="text-3xl font-bold text-white">What You Can Do</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/55">
                The remarkable finding is that most contrail warming comes from a{" "}
                <span className="text-teal-400">small fraction of flights</span> flying through
                ice-supersaturated air.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                Modest altitude changes (1,000–2,000 ft) can avoid these regions with{" "}
                <span className="text-teal-400">minimal fuel penalty</span> — typically under 2%
                additional fuel burn.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                As a passenger, you can use SkyPrint to compare flights by total climate impact and
                choose options with lower contrail risk. As an industry, contrail-aware flight planning
                represents one of the{" "}
                <span className="text-teal-400">most cost-effective climate interventions</span>{" "}
                available to aviation today.
              </p>
            </div>

            {/* Action cards */}
            {[
              {
                icon: (
                  <svg className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                ),
                title: "Choose Lower Impact Flights",
                body: "Compare total climate impact including CO₂ and contrails.",
                cta: "Compare Flights",
                href: "/compare",
              },
              {
                icon: (
                  <svg className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                  </svg>
                ),
                title: "Small Changes, Big Difference",
                body: "Altitude or timing adjustments can avoid high-risk conditions.",
                cta: "See How It Works",
                href: "/simulate",
              },
              {
                icon: (
                  <svg className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                ),
                title: "Support a Smarter Aviation Future",
                body: "Contrail-aware planning is one of the biggest opportunities to reduce aviation's warming.",
                cta: "Explore Solutions",
                href: "/airlines",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="flex flex-col rounded-2xl border border-white/10 p-6 backdrop-blur-sm transition hover:border-teal-400/20"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl border border-teal-400/20"
                  style={{ background: "rgba(45,212,191,0.08)", boxShadow: "0 0 24px rgba(45,212,191,0.08)" }}
                >
                  {card.icon}
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{card.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/50">{card.body}</p>
                <Link
                  href={card.href}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-teal-400 transition hover:text-teal-300"
                >
                  {card.cta}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="mt-8 border-t border-white/10 py-16"
        style={{ background: "rgba(0,0,0,0.4)" }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 overflow-hidden rounded-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/planeLogo.png" alt="SkyPrint" className="h-full w-full scale-[1.5] translate-y-[5px] translate-x-[1px] object-cover" />
                </div>
                <span className="text-lg font-bold text-white">SkyPrint</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/40">
                Clean aviation intelligence.<br />Carbon transparency at every altitude.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Product</p>
              <ul className="mt-3 space-y-2">
                {["Purchase Flights", "Simulate", "Airlines", "Impact Dashboard", "My Trips"].map((l) => (
                  <li key={l}><a href="#" className="text-xs text-white/50 transition hover:text-white/80">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Company</p>
              <ul className="mt-3 space-y-2">
                {["About", "Careers", "Press", "Blog", "Contact"].map((l) => (
                  <li key={l}><a href="#" className="text-xs text-white/50 transition hover:text-white/80">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Resources</p>
              <ul className="mt-3 space-y-2">
                {["How It Works", "Science", "FAQ", "Privacy", "Terms"].map((l) => (
                  <li key={l}><a href="#" className="text-xs text-white/50 transition hover:text-white/80">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Stay in the Loop</p>
              <p className="mt-3 text-xs text-white/40">Get updates on new features, climate insights, and more.</p>
              <NewsletterForm />
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-white/8 pt-6">
            <p className="text-xs text-white/25">© 2024 SkyPrint. All rights reserved.</p>
            <div className="flex gap-4">
              {/* X/Twitter */}
              <a href="#" className="text-white/30 transition hover:text-white/60">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.736-8.845L1.254 2.25H8.08l4.258 5.632 5.906-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="text-white/30 transition hover:text-white/60">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="text-white/30 transition hover:text-white/60">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
