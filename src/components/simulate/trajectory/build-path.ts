export function estimateCruiseAltitude(index: number, total: number): number {
  const f = total > 1 ? index / (total - 1) : 0;
  const CRUISE_FT = 35000;
  if (f < 0.1) return CRUISE_FT * (f / 0.1);
  if (f > 0.9) return CRUISE_FT * ((1 - f) / 0.1);
  return CRUISE_FT;
}

export function buildPolylinePath(
  values: number[],
  width: number,
  height: number,
  min: number,
  max: number,
): string {
  const range = max - min || 1;
  return values
    .map((value, i) => {
      const x = values.length > 1 ? (i / (values.length - 1)) * width : 0;
      const y = height - ((value - min) / range) * height;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}
