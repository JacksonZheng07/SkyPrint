"use client";

import { useState } from "react";
import { ImpactBreakdown } from "./impact-breakdown";

interface ImpactTooltipProps {
  co2Kg: number;
  contrailScore: number;
  totalScore: number;
  usedFallback: boolean;
}

export function ImpactTooltip({
  co2Kg,
  contrailScore,
  totalScore,
  usedFallback,
}: ImpactTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        aria-label="Impact score breakdown"
        className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-7 z-50 w-72 rounded-lg border border-border bg-popover p-4 shadow-lg">
          <ImpactBreakdown
            co2Kg={co2Kg}
            contrailScore={contrailScore}
            totalScore={totalScore}
          />

          <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Direct CO₂</span> comes from jet fuel combustion — roughly 3.16 kg CO₂ per kg fuel burned.
            </p>
            <p>
              <span className="font-medium text-foreground">Contrail warming</span> occurs when ice crystals form in humid air at cruise altitude and trap outgoing heat. Short-lived but potent — estimated to be responsible for more warming than aviation CO₂ in aggregate.
            </p>
            <p>
              <span className="font-medium text-foreground">Time of day matters</span> because night contrails cause net warming while daytime contrails partially reflect sunlight, slightly offsetting the effect.
            </p>
            {usedFallback && (
              <p className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                Contrail score is a modeled estimate — live atmospheric data unavailable for this route.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
