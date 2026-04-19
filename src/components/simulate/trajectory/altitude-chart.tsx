import { buildPolylinePath } from "./build-path";

interface RiskZone {
  index: number;
  persistent: boolean;
  sacSatisfied: boolean;
}

interface AltitudeChartProps {
  baselineAlts: number[];
  optimizedAlts: number[];
  riskZones: RiskZone[];
  minAlt: number;
  maxAlt: number;
}

const CHART_HEIGHT = 200;
const CHART_WIDTH = 600;
const PADDING = { top: 20, right: 20, bottom: 30, left: 50 };

export function AltitudeChart({
  baselineAlts,
  optimizedAlts,
  riskZones,
  minAlt,
  maxAlt,
}: AltitudeChartProps) {
  const plotW = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotH = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const baselinePath = buildPolylinePath(baselineAlts, plotW, plotH, minAlt, maxAlt);
  const optimizedPath = buildPolylinePath(optimizedAlts, plotW, plotH, minAlt, maxAlt);

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="w-full max-w-[600px]">
        <RiskZoneBands zones={riskZones} plotW={plotW} plotH={plotH} padding={PADDING} />
        <YAxisGrid minAlt={minAlt} maxAlt={maxAlt} plotH={plotH} padding={PADDING} />
        <XAxisLabels chartWidth={CHART_WIDTH} chartHeight={CHART_HEIGHT} padding={PADDING} />
        <path
          d={baselinePath}
          fill="none"
          stroke="rgb(239, 68, 68)"
          strokeWidth={2}
          strokeDasharray="6 3"
          transform={`translate(${PADDING.left}, ${PADDING.top})`}
        />
        <path
          d={optimizedPath}
          fill="none"
          stroke="rgb(34, 197, 94)"
          strokeWidth={2.5}
          transform={`translate(${PADDING.left}, ${PADDING.top})`}
        />
      </svg>
    </div>
  );
}

interface AxisProps {
  padding: typeof PADDING;
}

function RiskZoneBands({
  zones,
  plotW,
  plotH,
  padding,
}: AxisProps & { zones: RiskZone[]; plotW: number; plotH: number }) {
  if (zones.length < 2) return null;
  const bandWidth = plotW / (zones.length - 1);
  return (
    <>
      {zones.map((zone, i) => {
        if (!zone.sacSatisfied) return null;
        const x = padding.left + (i / (zones.length - 1)) * plotW - bandWidth / 2;
        return (
          <rect
            key={i}
            x={x}
            y={padding.top}
            width={bandWidth}
            height={plotH}
            fill={zone.persistent ? "rgba(239, 68, 68, 0.1)" : "rgba(251, 191, 36, 0.08)"}
          />
        );
      })}
    </>
  );
}

function YAxisGrid({
  minAlt,
  maxAlt,
  plotH,
  padding,
}: AxisProps & { minAlt: number; maxAlt: number; plotH: number }) {
  const range = maxAlt - minAlt || 1;
  const levels = [minAlt, (minAlt + maxAlt) / 2, maxAlt];
  return (
    <>
      {levels.map((alt) => {
        const y = padding.top + plotH - ((alt - minAlt) / range) * plotH;
        return (
          <g key={alt}>
            <text
              x={padding.left - 5}
              y={y + 4}
              textAnchor="end"
              className="fill-muted-foreground text-[10px]"
            >
              FL{Math.round(alt / 100)}
            </text>
            <line
              x1={padding.left}
              x2={CHART_WIDTH - padding.right}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.1}
            />
          </g>
        );
      })}
    </>
  );
}

function XAxisLabels({
  chartWidth,
  chartHeight,
  padding,
}: AxisProps & { chartWidth: number; chartHeight: number }) {
  return (
    <>
      <text x={padding.left} y={chartHeight - 5} className="fill-muted-foreground text-[10px]">
        Departure
      </text>
      <text
        x={chartWidth - padding.right}
        y={chartHeight - 5}
        textAnchor="end"
        className="fill-muted-foreground text-[10px]"
      >
        Arrival
      </text>
    </>
  );
}
