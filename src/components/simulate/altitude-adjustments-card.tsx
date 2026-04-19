import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SimulationResult } from "@/lib/types/comparison";

type Adjustment = SimulationResult["altitudeAdjustments"][number];

export function AltitudeAdjustmentsCard({ adjustments }: { adjustments: Adjustment[] }) {
  if (adjustments.length === 0) return null;
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="mb-4 text-lg font-semibold">Altitude Adjustments ({adjustments.length})</h3>
        <div className="space-y-2">
          {adjustments.map((adj, i) => (
            <AdjustmentRow key={i} adjustment={adj} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AdjustmentRow({ adjustment: adj }: { adjustment: Adjustment }) {
  const delta = adj.suggestedAltitudeFt - adj.originalAltitudeFt;
  const fromFL = Math.round(adj.originalAltitudeFt / 100);
  const toFL = Math.round(adj.suggestedAltitudeFt / 100);
  return (
    <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
      <div>
        <span className="font-medium">Waypoint {adj.waypointIndex + 1}</span>
        <span className="ml-2 text-muted-foreground">
          FL{fromFL} → FL{toFL}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={delta < 0 ? "default" : "secondary"}>
          {delta > 0 ? "+" : ""}
          {delta.toLocaleString()} ft
        </Badge>
        <span className="text-xs text-muted-foreground">{adj.reason}</span>
      </div>
    </div>
  );
}
