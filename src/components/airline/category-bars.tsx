import type { AirlineScore } from "@/lib/types/airline";
import {
  CATEGORY_ORDER,
  CATEGORY_META,
  type CategoryKey,
} from "@/lib/utils/airline-categories";
import { categoryBarColor } from "@/lib/utils/grades";

type Categories = AirlineScore["categories"];

export function HorizontalCategoryBars({ categories }: { categories: Categories }) {
  return (
    <div className="mt-4 space-y-1.5 text-left">
      {CATEGORY_ORDER.map((key) => (
        <HorizontalCategoryBar key={key} label={CATEGORY_META[key].icon} value={categories[key]} />
      ))}
    </div>
  );
}

function HorizontalCategoryBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 text-[10px]">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${categoryBarColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-6 text-right text-[10px] text-muted-foreground">{value}</span>
    </div>
  );
}

export function VerticalCategoryBars({ categories }: { categories: Categories }) {
  return (
    <div className="hidden sm:flex sm:gap-1">
      {CATEGORY_ORDER.map((key) => (
        <VerticalCategoryBar key={key} categoryKey={key} value={categories[key]} />
      ))}
    </div>
  );
}

function VerticalCategoryBar({ categoryKey, value }: { categoryKey: CategoryKey; value: number }) {
  return (
    <div
      className="h-8 w-1.5 overflow-hidden rounded-full bg-muted"
      title={`${categoryKey}: ${value}`}
    >
      <div
        className={`w-full rounded-full ${categoryBarColor(value)}`}
        style={{ height: `${value}%`, marginTop: `${100 - value}%` }}
      />
    </div>
  );
}
