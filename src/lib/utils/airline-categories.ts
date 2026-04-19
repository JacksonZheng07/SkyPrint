export type CategoryKey =
  | "contrailMitigation"
  | "fleetEfficiency"
  | "sustainableFuel"
  | "routeOptimization"
  | "emissionsTrajectory";

export interface CategoryMeta {
  label: string;
  icon: string;
  weight: number;
  description: string;
}

export const CATEGORY_META: Record<CategoryKey, CategoryMeta> = {
  contrailMitigation: {
    label: "Contrail Avoidance",
    icon: "☁️",
    weight: 30,
    description: "Active contrail avoidance programs",
  },
  fleetEfficiency: {
    label: "Fuel Efficiency",
    icon: "✈️",
    weight: 25,
    description: "Aircraft fuel efficiency and fleet age",
  },
  sustainableFuel: {
    label: "SAF Adoption",
    icon: "🌱",
    weight: 20,
    description: "Sustainable aviation fuel adoption %",
  },
  routeOptimization: {
    label: "Route Optimization",
    icon: "🗺️",
    weight: 15,
    description: "Flight path and altitude planning",
  },
  emissionsTrajectory: {
    label: "Emissions Trajectory",
    icon: "📉",
    weight: 10,
    description: "Year-over-year emissions improvement",
  },
};

export const CATEGORY_ORDER: CategoryKey[] = [
  "contrailMitigation",
  "fleetEfficiency",
  "sustainableFuel",
  "routeOptimization",
  "emissionsTrajectory",
];
