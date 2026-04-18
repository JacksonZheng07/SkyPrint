export default function MissionPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-12 px-4 py-16">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Our Mission</h1>
        <p className="text-lg text-muted-foreground">
          Making aviation&apos;s hidden climate impact visible and actionable.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">The Invisible Problem</h2>
        <p className="leading-relaxed text-muted-foreground">
          When you book a flight, you might see a carbon offset option. But CO2
          is only part of the story. Condensation trails — contrails — form when
          hot, humid engine exhaust meets cold air at cruise altitude. In the
          right atmospheric conditions, these thin ice-crystal clouds persist for
          hours, trapping outgoing heat radiation like a blanket.
        </p>
        <p className="leading-relaxed text-muted-foreground">
          Research from institutions including MIT, DLR, and Imperial College
          London estimates that contrails cause approximately 35% of
          aviation&apos;s total climate warming effect. For some flights, the
          contrail impact alone can be 2-4x greater than the CO2 emitted.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">The Science</h2>
        <div className="space-y-4 rounded-lg border p-6">
          <h3 className="font-semibold">Schmidt-Appleman Criterion (SAC)</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Contrails form when the mixing of hot exhaust with ambient air passes
            through liquid water saturation. The SAC predicts whether this
            threshold is crossed based on temperature, pressure, and humidity at
            cruise altitude. If the surrounding air is also ice-supersaturated,
            the contrail persists.
          </p>
        </div>
        <div className="space-y-4 rounded-lg border p-6">
          <h3 className="font-semibold">CoCiP (Contrail Cirrus Prediction)</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Developed by DLR and extended by Breakthrough Energy, CoCiP models
            the full lifecycle of a contrail — formation, spreading, and
            dissipation — computing the net energy forcing (warming or cooling)
            over its lifetime. SkyPrint uses CoCiP via the open-source
            PyContrails library.
          </p>
        </div>
        <div className="space-y-4 rounded-lg border p-6">
          <h3 className="font-semibold">Radiative Forcing</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Contrails interact with both incoming solar radiation (cooling effect
            during daytime) and outgoing thermal radiation (warming effect at all
            times). At night, the net effect is almost always warming. SkyPrint
            calculates the energy forcing in Watts per square meter (W/m²) for
            each flight segment.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">What You Can Do</h2>
        <p className="leading-relaxed text-muted-foreground">
          The remarkable finding is that most contrail warming comes from a small
          fraction of flights flying through ice-supersaturated air. Modest
          altitude changes (1,000-2,000 ft) can avoid these regions with
          minimal fuel penalty — typically under 2% additional fuel burn.
        </p>
        <p className="leading-relaxed text-muted-foreground">
          As a passenger, you can use SkyPrint to compare flights by total
          climate impact and choose options with lower contrail risk. As an
          industry, contrail-aware flight planning represents one of the most
          cost-effective climate interventions available to aviation today.
        </p>
      </section>
    </div>
  );
}
