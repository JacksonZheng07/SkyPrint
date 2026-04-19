"use client";

const LEVELS = [
  { label: "Very High", color: "#ef4444" },
  { label: "High",      color: "#f97316" },
  { label: "Medium",    color: "#eab308" },
  { label: "Low",       color: "#22c55e" },
  { label: "Very Low",  color: "#2dd4bf" },
];

export function ContrailRiskLegend() {
  return (
    <div className="w-44 rounded-xl border border-white/15 bg-[#070c18]/82 backdrop-blur-[4px] px-4 py-4">
      <p className="text-[11px] font-semibold text-white mb-4 leading-snug">
        Contrail Formation<br />Potential
      </p>

      <div className="flex gap-3">
        {/* Gradient bar — taller to match mockup */}
        <div
          className="w-2.5 rounded-full shrink-0"
          style={{
            height: "140px",
            background: "linear-gradient(to bottom, #ef4444, #f97316, #eab308, #22c55e, #2dd4bf)",
          }}
        />
        {/* Labels — spread evenly over the bar height */}
        <div className="flex flex-col justify-between" style={{ height: "140px" }}>
          {LEVELS.map(({ label, color }) => (
            <span key={label} className="text-[11px] font-medium leading-none" style={{ color }}>
              {label}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-3 text-[9px] text-white/30 leading-tight">
        ⓘ Based on humidity, temperature &amp; ice supersaturation
      </p>
    </div>
  );
}
