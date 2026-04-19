"use client";

import type { AirlineScore } from "@/lib/types/airline";
import { GradeHero } from "./grade-hero";
import { CategoryGrid } from "./category-grid";
import { MethodologyCard } from "./methodology-card";
import { NarrativeCard } from "./narrative-card";

export function Scorecard({ score }: { score: AirlineScore }) {
  return (
    <div className="space-y-6">
      <GradeHero score={score} />
      <CategoryGrid categories={score.categories} />
      <MethodologyCard />
      <NarrativeCard narrative={score.narrative} />
    </div>
  );
}
