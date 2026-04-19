"use client";

interface Props {
  contrailProbability: number | null;
  co2Kg: number | null;
  loading: boolean;
}

function getRiskInfo(p: number): { label: string; color: string } {
  if (p < 0.3) return { label: "Low", color: "#2dd4bf" };
  if (p < 0.6) return { label: "Medium", color: "#eab308" };
  return { label: "High", color: "#ef4444" };
}

export function AtmosphericOverview({ contrailProbability, co2Kg, loading }: Props) {
  const risk = contrailProbability !== null ? getRiskInfo(contrailProbability) : null;

  return (
    <div className="w-72 rounded-2xl border border-white/[0.08] bg-black/40 shadow-2xl shadow-black/30 backdrop-blur-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-white tracking-tight">Atmospheric Overview</span>
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.04] text-[9px] text-white/40">i</span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatCell
          label="Humidity"
          value="42%"
          sub="Medium"
          subColor="#60a5fa"
          loading={false}
        />
        <StatCell
          label="Temperature"
          value="-48°C"
          sub="At cruising alt."
          subColor="#94a3b8"
          loading={false}
        />
        <StatCell
          label="CO₂"
          value={co2Kg !== null ? `${Math.round(co2Kg)} kg` : "–"}
          sub="per passenger"
          subColor="#94a3b8"
          loading={loading && co2Kg === null}
        />
        <StatCell
          label="Contrail Risk"
          value={risk ? risk.label : "–"}
          sub="Overall"
          subColor={risk?.color ?? "#94a3b8"}
          loading={loading && contrailProbability === null}
          valueColor={risk?.color}
        />
      </div>
    </div>
  );
}

interface StatCellProps {
  label: string;
  value: string;
  sub: string;
  subColor: string;
  loading: boolean;
  valueColor?: string;
}

function StatCell({ label, value, sub, subColor, loading, valueColor }: StatCellProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-white/40 leading-none">{label}</span>
      {loading ? (
        <div className="h-5 w-12 rounded bg-white/10 animate-pulse" />
      ) : (
        <span className="text-sm font-semibold leading-tight" style={{ color: valueColor ?? "#ffffff" }}>
          {value}
        </span>
      )}
      <span className="text-[10px] leading-none" style={{ color: subColor }}>
        {sub}
      </span>
    </div>
  );
}
