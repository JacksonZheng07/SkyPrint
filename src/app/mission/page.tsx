import Link from "next/link";

export default function MissionPage() {
  return (
    <div
      className="relative min-h-screen text-white"
      style={{
        backgroundImage: "url('/mission-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay so panels are readable */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(4,10,22,0.82) 0%, rgba(4,10,22,0.70) 40%, rgba(4,10,22,0.80) 100%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl space-y-3 px-4 pb-0 pt-20">

        {/* ── Hero row ── */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* Top-left: Our Mission + stats */}
          <div
            className="rounded-2xl border border-teal-400/20 p-8"
            style={{
              background: "rgba(8,18,40,0.60)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 0 0 1px rgba(45,212,191,0.12), 0 0 40px rgba(45,212,191,0.07), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-400">Our Mission</p>
            <h1 className="mt-2 text-5xl font-extrabold leading-none tracking-tight">
              The real climate<br />impact of aviation
            </h1>
            <p className="mt-3 text-base leading-relaxed text-white/60">
              Making aviation&apos;s hidden climate impact{" "}
              <span className="font-semibold text-teal-400">visible</span> and{" "}
              <span className="font-semibold text-teal-400">actionable.</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/50">
              Aviation&apos;s total climate impact goes beyond CO₂. Non-CO₂ effects like
              contrails contribute the majority of aviation&apos;s warming.
            </p>

            {/* Donut + stat row */}
            <div className="mt-6 flex items-center gap-6">
              {/* SVG donut chart */}
              <div className="relative shrink-0">
                <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90">
                  <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
                  {/* ~35% teal slice */}
                  <circle
                    cx="60" cy="60" r="46"
                    fill="none"
                    stroke="url(#donutTeal)"
                    strokeWidth="14"
                    strokeDasharray={`${0.35 * 2 * Math.PI * 46} ${2 * Math.PI * 46}`}
                    strokeLinecap="round"
                  />
                  {/* ~65% amber slice */}
                  <circle
                    cx="60" cy="60" r="46"
                    fill="none"
                    stroke="url(#donutAmber)"
                    strokeWidth="14"
                    strokeDasharray={`${0.65 * 2 * Math.PI * 46} ${2 * Math.PI * 46}`}
                    strokeDashoffset={`-${0.35 * 2 * Math.PI * 46}`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="donutTeal" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2dd4bf" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="donutAmber" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-extrabold text-white">~2–4x</span>
                  <span className="text-[9px] text-white/40 text-center leading-tight">total impact<br />vs CO₂ alone</span>
                </div>
              </div>

              {/* Stat cards */}
              <div className="flex flex-col gap-2 flex-1">
                <div
                  className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3"
                  style={{ background: "rgba(45,212,191,0.07)", boxShadow: "inset 0 0 20px rgba(45,212,191,0.04)" }}
                >
                  <svg className="h-6 w-6 shrink-0 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
                  </svg>
                  <div>
                    <p className="text-xl font-bold text-teal-300">~35%</p>
                    <p className="text-[10px] text-white/40">of aviation&apos;s total warming from contrails</p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3"
                  style={{ background: "rgba(251,146,60,0.07)", boxShadow: "inset 0 0 20px rgba(251,146,60,0.03)" }}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-400/30 text-[9px] font-bold text-amber-400">CO₂</span>
                  <div>
                    <p className="text-xl font-bold text-amber-300">~65%</p>
                    <p className="text-[10px] text-white/40">from CO₂ emissions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top-right: How Contrails Warm the Planet */}
          <div
            className="rounded-2xl border border-teal-400/20 p-8 overflow-hidden relative"
            style={{
              background: "rgba(8,18,40,0.55)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 0 0 1px rgba(45,212,191,0.12), 0 0 40px rgba(45,212,191,0.07), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-400">How Contrails Warm the Planet</p>
            <h2 className="mt-1 text-3xl font-extrabold">A hidden multiplier</h2>

            {/* Airplane + contrail SVG illustration */}
            <div className="relative mt-4 h-28 w-full overflow-hidden rounded-xl border border-white/8" style={{ background: "rgba(0,0,0,0.25)" }}>
              {/* Sky gradient */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,40,80,0.6) 0%, rgba(5,20,50,0.8) 100%)" }} />
              {/* Earth arc */}
              <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 600 80" fill="none">
                <ellipse cx="300" cy="100" rx="500" ry="100" fill="rgba(45,212,191,0.08)" stroke="rgba(45,212,191,0.2)" strokeWidth="1" />
              </svg>
              {/* Contrail lines */}
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 110" fill="none">
                <path d="M60 55 Q300 30 540 55" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="5 3" />
                <path d="M60 62 Q300 37 540 62" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="5 3" />
                {/* Plane body */}
                <g transform="translate(290,38)">
                  <path d="M0 0 L-18 4 L-18 7 L0 5 L18 7 L18 4 Z" fill="white" opacity="0.9" />
                  <path d="M-4 5 L-12 14 L-9 14 L0 7 L9 14 L12 14 L4 5 Z" fill="white" opacity="0.7" />
                  <path d="M-10 5 L-18 8 L-16 9 L-8 6 Z" fill="white" opacity="0.6" />
                </g>
                {/* Radiation arrows — heat trapped */}
                <path d="M480 20 Q490 15 500 20 Q510 25 520 20" stroke="rgba(251,191,36,0.8)" strokeWidth="1.5" fill="none" />
                <path d="M480 30 Q490 25 500 30 Q510 35 520 30" stroke="rgba(251,191,36,0.6)" strokeWidth="1.5" fill="none" />
                {/* Radiation arrows — cooling */}
                <line x1="540" y1="60" x2="540" y2="20" stroke="rgba(56,189,248,0.7)" strokeWidth="1.5" />
                <line x1="555" y1="60" x2="555" y2="20" stroke="rgba(56,189,248,0.6)" strokeWidth="1" />
                <polygon points="540,18 537,24 543,24" fill="rgba(56,189,248,0.8)" />
                <polygon points="555,18 552,24 558,24" fill="rgba(56,189,248,0.6)" />
              </svg>
              {/* Labels */}
              <div className="absolute right-3 top-2 space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="h-0.5 w-5 rounded" style={{ background: "repeating-linear-gradient(90deg,rgba(251,191,36,0.8) 0,rgba(251,191,36,0.8) 3px,transparent 3px,transparent 6px)" }} />
                  <span className="text-[9px] text-amber-300">Outgoing heat trapped<br />(warming effect)</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="h-0.5 w-5 bg-sky-400/70" />
                  <span className="text-[9px] text-sky-300">Less solar radiation<br />(cooling effect)</span>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="mt-4 flex items-center justify-start gap-3">
              {[
                { num: "1", label: "Hot, humid\nexhaust" },
                { num: "2", label: "Mixing with\ncold air" },
                { num: "3", label: "Ice crystals form\ncontrails" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-teal-200"
                      style={{ background: "rgba(45,212,191,0.15)", border: "1px solid rgba(45,212,191,0.35)", boxShadow: "0 0 10px rgba(45,212,191,0.15)" }}
                    >
                      {step.num}
                    </div>
                    <p className="whitespace-pre text-center text-[10px] text-white/50 leading-snug">{step.label}</p>
                  </div>
                  {i < 2 && (
                    <svg className="h-3 w-3 shrink-0 text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── The Invisible Problem + Radiative Forcing ── */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* The Invisible Problem */}
          <div
            className="rounded-2xl border border-teal-400/20 p-8"
            style={{
              background: "rgba(8,18,40,0.58)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 0 0 1px rgba(45,212,191,0.12), 0 0 40px rgba(45,212,191,0.06), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <h2 className="text-2xl font-bold text-white">The Invisible Problem</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              When you book a flight, you might see a carbon offset option.
              But CO₂ is only part of the story.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Condensation trails — contrails — form when hot, humid engine exhaust meets cold air
              at cruise altitude. In the right atmospheric conditions, these thin ice-crystal clouds
              persist for hours, trapping outgoing heat radiation like a blanket.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Research from institutions including MIT, DLR, and Imperial College London estimates
              that contrails cause approximately{" "}
              <span className="font-semibold text-teal-400">35%</span> of aviation&apos;s total
              climate warming effect. For some flights, the contrail impact alone can be{" "}
              <span className="font-semibold text-teal-400">2–4x greater</span> than the CO₂ emitted.
            </p>
            <Link
              href="/simulate"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-teal-400/40 hover:text-teal-300"
            >
              See the Science Behind It
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Radiative Forcing */}
          <div
            className="rounded-2xl border border-teal-400/20 p-8"
            style={{
              background: "rgba(8,18,40,0.58)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 0 0 1px rgba(45,212,191,0.12), 0 0 40px rgba(45,212,191,0.06), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-400">Radiative Forcing</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Solar vs. thermal radiation</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Contrails interact with both incoming solar radiation (cooling effect during daytime)
              and outgoing thermal radiation (warming effect at all times). At night, the net effect
              is almost always warming.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              SkyPrint calculates the energy forcing in Watts per square meter (W/m²) for each flight segment.
            </p>
            {/* RF diagram */}
            <div className="mt-4 overflow-hidden rounded-xl border border-white/8" style={{ background: "rgba(0,0,0,0.2)" }}>
              <svg viewBox="0 0 480 140" fill="none" className="w-full">
                {/* Sun */}
                <circle cx="80" cy="70" r="32" fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.25)" strokeWidth="1" />
                <circle cx="80" cy="70" r="20" fill="rgba(251,191,36,0.18)" stroke="rgba(251,191,36,0.4)" strokeWidth="1" />
                <circle cx="80" cy="70" r="11" fill="rgba(251,191,36,0.35)" />
                {/* Solar rays (cooling) */}
                <line x1="118" y1="58" x2="220" y2="50" stroke="rgba(56,189,248,0.7)" strokeWidth="1.5" strokeDasharray="5 3" />
                <line x1="118" y1="70" x2="220" y2="68" stroke="rgba(56,189,248,0.6)" strokeWidth="1.5" strokeDasharray="5 3" />
                <line x1="118" y1="82" x2="220" y2="86" stroke="rgba(56,189,248,0.4)" strokeWidth="1" strokeDasharray="5 3" />
                {/* Thermal upward (warming) */}
                <line x1="300" y1="115" x2="300" y2="30" stroke="rgba(251,113,33,0.9)" strokeWidth="1.5" />
                <line x1="325" y1="115" x2="325" y2="30" stroke="rgba(251,113,33,0.75)" strokeWidth="1.5" />
                <line x1="350" y1="115" x2="350" y2="30" stroke="rgba(251,113,33,0.6)" strokeWidth="1.2" />
                <line x1="375" y1="115" x2="375" y2="30" stroke="rgba(251,113,33,0.4)" strokeWidth="1" />
                <polygon points="300,28 296,36 304,36" fill="rgba(251,113,33,0.9)" />
                <polygon points="325,28 321,36 329,36" fill="rgba(251,113,33,0.8)" />
                <polygon points="350,28 346,36 354,36" fill="rgba(251,113,33,0.6)" />
                <polygon points="375,28 371,36 379,36" fill="rgba(251,113,33,0.4)" />
                {/* Earth */}
                <ellipse cx="240" cy="140" rx="240" ry="40" fill="rgba(45,212,191,0.06)" stroke="rgba(45,212,191,0.2)" strokeWidth="0.8" />
                {/* Labels */}
                <text x="135" y="38" fontSize="9" fill="rgba(56,189,248,0.85)" fontWeight="600">Solar (shortwave) · Reflection</text>
                <text x="150" y="49" fontSize="9" fill="rgba(56,189,248,0.6)">Cooling</text>
                <text x="290" y="22" fontSize="9" fill="rgba(251,113,33,0.9)" fontWeight="600">Thermal (longwave) · Emission</text>
                <text x="310" y="33" fontSize="9" fill="rgba(251,113,33,0.7)">Warming</text>
              </svg>
            </div>
          </div>
        </section>

        {/* ── The Science ── */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* SAC */}
          <div
            className="rounded-2xl border border-teal-400/20 p-8"
            style={{
              background: "rgba(8,18,40,0.58)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 0 0 1px rgba(45,212,191,0.12), 0 0 40px rgba(45,212,191,0.06), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-400">The Science</p>
            <div className="mt-3 flex items-start gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-teal-400/20"
                style={{ background: "rgba(45,212,191,0.1)", boxShadow: "0 0 16px rgba(45,212,191,0.12)" }}
              >
                <svg className="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
            <div className="mt-5 flex items-center gap-2">
              {[
                { label: "Inputs", sub: "Temperature\nPressure\nHumidity" },
                { label: "Predicts", sub: "Contrail\nFormation" },
                { label: "Outcome", sub: "Persistent\nContrail" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="rounded-lg border border-white/10 px-3 py-2 text-center" style={{ background: "rgba(45,212,191,0.06)" }}>
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

          {/* CoCiP */}
          <div
            className="rounded-2xl border border-teal-400/20 p-8"
            style={{
              background: "rgba(8,18,40,0.58)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 0 0 1px rgba(45,212,191,0.12), 0 0 40px rgba(45,212,191,0.06), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-400">The Science</p>
            <div className="mt-3 flex items-start gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-teal-400/20"
                style={{ background: "rgba(45,212,191,0.1)", boxShadow: "0 0 16px rgba(45,212,191,0.12)" }}
              >
                <svg className="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">CoCiP (Contrail Cirrus Prediction)</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  Developed by DLR and extended by Breakthrough Energy, CoCiP models the full
                  lifecycle of a contrail — formation, spreading, and dissipation — computing
                  the net energy forcing (warming or cooling) over its lifetime. SkyPrint uses
                  CoCiP via the open-source PyContrails library.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2">
              {[
                { label: "Models", sub: "Lifecycle" },
                { label: "Computes", sub: "Energy Forcing\n(W/m²)" },
                { label: "Outputs", sub: "Net Warming\nor Cooling" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="rounded-lg border border-white/10 px-3 py-2 text-center" style={{ background: "rgba(45,212,191,0.06)" }}>
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
        </section>

        {/* ── What You Can Do ── */}
        <section
          className="rounded-2xl border border-teal-400/20 p-8"
          style={{
            background: "rgba(8,18,40,0.58)",
            backdropFilter: "blur(14px)",
            boxShadow: "0 0 0 1px rgba(45,212,191,0.12), 0 0 40px rgba(45,212,191,0.06), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div>
              <h2 className="text-2xl font-bold text-white">What You Can Do</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                Most contrail warming comes from a{" "}
                <span className="text-teal-400">small fraction of flights</span> flying through
                ice-supersaturated air. Modest altitude changes (1,000–2,000 ft) can avoid these
                regions with <span className="text-teal-400">minimal fuel penalty</span> — typically
                under 2% additional fuel burn.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Contrail-aware flight planning represents one of the{" "}
                <span className="text-teal-400">most cost-effective climate interventions</span>{" "}
                available to aviation today.
              </p>
            </div>
            {[
              {
                icon: (
                  <svg className="h-7 w-7 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                  <svg className="h-7 w-7 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                  <svg className="h-7 w-7 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                className="flex flex-col rounded-xl border border-white/10 p-5 transition hover:border-teal-400/25"
                style={{ background: "rgba(45,212,191,0.04)", boxShadow: "inset 0 0 20px rgba(45,212,191,0.03)" }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-teal-400/20"
                  style={{ background: "rgba(45,212,191,0.08)", boxShadow: "0 0 20px rgba(45,212,191,0.1)" }}
                >
                  {card.icon}
                </div>
                <h3 className="mt-3 text-base font-bold text-white">{card.title}</h3>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-white/50">{card.body}</p>
                <Link
                  href={card.href}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-teal-400 transition hover:text-teal-300"
                >
                  {card.cta}
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
