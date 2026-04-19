import type { AirlineScore } from "@/lib/types/airline";
import {
  CATEGORY_ORDER,
  CATEGORY_META,
  type CategoryKey,
} from "@/lib/utils/airline-categories";
import { categoryBarColor } from "@/lib/utils/grades";

type Categories = AirlineScore["categories"];

export function HorizontalCategoryBars({
  categories,
  dark = false,
}: {
  categories: Categories;
  dark?: boolean;
}) {
  return (
    <div className="mt-4 space-y-1.5 text-left">
      {CATEGORY_ORDER.map((key) => (
        <HorizontalCategoryBar
          key={key}
          label={CATEGORY_META[key].icon}
          value={categories[key]}
          dark={dark}
        />
      ))}
    </div>
  );
}

function HorizontalCategoryBar({
  label,
  value,
  dark,
}: {
  label: string;
  value: number;
  dark: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 text-[10px]">{label}</span>
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full"
        style={{ background: dark ? "rgba(255,255,255,0.10)" : "var(--muted)" }}
      >
        <div
          className={`h-full rounded-full ${categoryBarColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span
        className="w-6 text-right text-[10px]"
        style={{ color: dark ? "rgba(255,255,255,0.45)" : "var(--muted-foreground)" }}
      >
        {value}
      </span>
    </div>
  );
}

export function VerticalCategoryBars({
  categories,
  dark = false,
}: {
  categories: Categories;
  dark?: boolean;
}) {
  return (
    <div className="hidden sm:flex sm:gap-1">
      {CATEGORY_ORDER.map((key) => (
        <VerticalCategoryBar key={key} categoryKey={key} value={categories[key]} dark={dark} />
      ))}
    </div>
  );
}

function VerticalCategoryBar({
  categoryKey,
  value,
  dark,
}: {
  categoryKey: CategoryKey;
  value: number;
  dark: boolean;
}) {
  return (
    <div
      className="h-8 w-1.5 overflow-hidden rounded-full"
      style={{ background: dark ? "rgba(255,255,255,0.10)" : "var(--muted)" }}
      title={`${categoryKey}: ${value}`}
    >
      <div
        className={`w-full rounded-full ${categoryBarColor(value)}`}
        style={{ height: `${value}%`, marginTop: `${100 - value}%` }}
      />
    </div>
  );
}
