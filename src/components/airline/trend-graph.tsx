"use client";

import { Card, CardContent } from "@/components/ui/card";

interface TrendGraphProps {
  airlineName: string;
}

// Simulated historical efficiency trend data
const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
const TREND_DATA: Record<string, number[]> = {
  "American Airlines": [3.4, 3.5, 3.3, 3.2, 3.15, 3.1, 3.05],
  "United Airlines": [3.5, 3.4, 3.3, 3.2, 3.1, 2.95, 2.9],
  "Delta Air Lines": [3.3, 3.4, 3.3, 3.2, 3.1, 3.05, 3.0],
  "British Airways": [3.4, 3.5, 3.4, 3.3, 3.25, 3.2, 3.15],
  Lufthansa: [3.2, 3.3, 3.2, 3.1, 3.0, 2.9, 2.85],
};

export function TrendGraph({ airlineName }: TrendGraphProps) {
  const data = TREND_DATA[airlineName] ?? TREND_DATA["United Airlines"]!;

  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const range = maxVal - minVal || 0.1;

  const chartH = 120;
  const chartW = 400;
  const pad = { top: 10, right: 10, bottom: 20, left: 40 };
  const plotW = chartW - pad.left - pad.right;
  const plotH = chartH - pad.top - pad.bottom;

  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * plotW,
    y: plotH - ((val - minVal) / range) * plotH,
  }));

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="mb-4 text-lg font-semibold">
          Fuel Efficiency Trend (L/100km/pax)
        </h3>
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="w-full max-w-[400px]"
          >
            {/* Y-axis labels */}
            {[minVal, (minVal + maxVal) / 2, maxVal].map((val) => {
              const y =
                pad.top + plotH - ((val - minVal) / range) * plotH;
              return (
                <g key={val}>
                  <text
                    x={pad.left - 4}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-muted-foreground text-[9px]"
                  >
                    {val.toFixed(1)}
                  </text>
                  <line
                    x1={pad.left}
                    x2={chartW - pad.right}
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity={0.08}
                  />
                </g>
              );
            })}

            {/* X-axis year labels */}
            {YEARS.map((year, i) => (
              <text
                key={year}
                x={pad.left + (i / (YEARS.length - 1)) * plotW}
                y={chartH - 4}
                textAnchor="middle"
                className="fill-muted-foreground text-[9px]"
              >
                {year}
              </text>
            ))}

            {/* Line */}
            <path
              d={path}
              fill="none"
              stroke="rgb(56, 189, 248)"
              strokeWidth={2}
              transform={`translate(${pad.left}, ${pad.top})`}
            />

            {/* Data points */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={pad.left + p.x}
                cy={pad.top + p.y}
                r={3}
                fill="rgb(56, 189, 248)"
              />
            ))}
          </svg>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Lower values indicate better fuel efficiency per passenger-kilometer.
        </p>
      </CardContent>
    </Card>
  );
}
