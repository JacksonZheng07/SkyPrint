"use client";

import { Map, Cloud, Droplets, Wind, Thermometer, Play, Pause, RefreshCw } from "lucide-react";

const LAYERS = [
  { id: "map",         label: "Map",         Icon: Map,         available: true  },
  { id: "clouds",      label: "Clouds",      Icon: Cloud,       available: false },
  { id: "humidity",    label: "Humidity",    Icon: Droplets,    available: false },
  { id: "winds",       label: "Winds",       Icon: Wind,        available: false },
  { id: "temperature", label: "Temperature", Icon: Thermometer, available: false },
];

interface Props {
  flightDate: string | null;
  currentHour: number;
  onHourChange: (h: number) => void;
  onAnimate: () => void;
  activeLayer: string;
  onLayerChange: (layer: string) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
}

function formatDateTime(dateStr: string, hours: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()} · ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")} UTC`;
}

function hourLabel(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

export function PlaygroundBottomBar({
  flightDate,
  currentHour,
  onHourChange,
  onAnimate,
  activeLayer,
  onLayerChange,
  isPlaying,
  onPlayToggle,
}: Props) {
  return (
    <div className="mx-4 mb-4 rounded-xl border border-white/15 bg-[#070c18]/88 backdrop-blur-[4px] overflow-hidden">
      {/* Layer switcher */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-white/5">
        {LAYERS.map(({ id, label, Icon, available }) => (
          <button
            key={id}
            onClick={() => available && onLayerChange(id)}
            title={available ? undefined : "Requires weather API key"}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              available
                ? activeLayer === id
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:bg-white/10 hover:text-white/80"
                : "text-white/20 cursor-not-allowed"
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Play/pause */}
        <button
          onClick={onPlayToggle}
          disabled={!flightDate}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>

        {/* Date + time label */}
        <span className="shrink-0 text-xs font-medium text-white/70 min-w-[200px]">
          {flightDate ? formatDateTime(flightDate, currentHour) : "Select a flight to explore"}
        </span>

        {/* Time scrubber */}
        <div className="flex-1 flex flex-col gap-1">
          <input
            type="range"
            min={0}
            max={24}
            step={0.5}
            value={currentHour}
            disabled={!flightDate}
            onChange={(e) => onHourChange(parseFloat(e.target.value))}
            className="w-full h-1 accent-teal-400 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
          />
          <div className="flex justify-between text-[9px] text-white/30">
            {[0, 6, 12, 18, 24].map((h) => (
              <span key={h}>{hourLabel(h)}</span>
            ))}
          </div>
        </div>

        {/* Animate button */}
        <button
          onClick={onAnimate}
          disabled={!flightDate}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/15 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <RefreshCw size={12} />
          Animate
        </button>
      </div>
    </div>
  );
}
