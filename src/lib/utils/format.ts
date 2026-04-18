export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatCo2(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}t CO2`;
  }
  return `${Math.round(kg)}kg CO2`;
}

export function formatContrailRisk(
  rating: "low" | "medium" | "high"
): { label: string; color: string } {
  switch (rating) {
    case "low":
      return { label: "Low Risk", color: "text-green-600" };
    case "medium":
      return { label: "Medium Risk", color: "text-amber-500" };
    case "high":
      return { label: "High Risk", color: "text-red-600" };
  }
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatPercent(n: number): string {
  return `${Math.round(n * 100)}%`;
}
