export type CategoryKey =
  | "fleetEfficiency"
  | "routeOptimization"
  | "contrailMitigation"
  | "sustainableFuel";

export interface CategoryMeta {
  label: string;
  icon: string;
  description: string;
}

export const CATEGORY_META: Record<CategoryKey, CategoryMeta> = {
  fleetEfficiency: {
    label: "Fleet Efficiency",
    icon: "✈️",
    description: "Aircraft fuel efficiency and fleet age",
  },
  routeOptimization: {
    label: "Route Optimization",
    icon: "🗺️",
    description: "Flight path and altitude planning",
  },
  contrailMitigation: {
    label: "Contrail Mitigation",
    icon: "☁️",
    description: "Active contrail avoidance programs",
  },
  sustainableFuel: {
    label: "Sustainable Fuel",
    icon: "🌱",
    description: "SAF adoption percentage",
  },
};

export const CATEGORY_ORDER: CategoryKey[] = [
  "contrailMitigation",
  "fleetEfficiency",
  "routeOptimization",
  "sustainableFuel",
];
