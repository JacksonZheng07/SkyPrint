"use client";

import { RouteInput } from "@/components/simulate/route-input";
import { TrajectoryViewer } from "@/components/simulate/trajectory-viewer";
import { OptimizationPanel } from "@/components/simulate/optimization-panel";
import { useSimulation } from "@/hooks/use-simulation";

export default function SimulatePage() {
  const { result, isLoading, error, simulate } = useSimulation();

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Simulate Route</h1>
        <p className="mt-2 text-muted-foreground">
          Visualize how altitude optimization reduces contrail formation while
          minimizing fuel penalties.
        </p>
      </div>

      <RouteInput onSimulate={simulate} isLoading={isLoading} />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">
              Running altitude optimization against contrail model...
            </p>
          </div>
        </div>
      )}

      {result && !isLoading && (
        <>
          <TrajectoryViewer result={result} />
          <OptimizationPanel result={result} />
        </>
      )}
    </div>
  );
}
