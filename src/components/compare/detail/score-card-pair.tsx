"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreCircle } from "@/components/compare/score-circle";

interface ScoreCardPairProps {
  scoreA: number;
  scoreB: number;
  better: "a" | "b";
}

export function ScoreCardPair({ scoreA, scoreB, better }: ScoreCardPairProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="mb-6 text-center text-lg font-semibold">Total Impact Score</h2>
        <div className="grid grid-cols-2 gap-8">
          <ScoreColumn score={scoreA} isBetter={better === "a"} />
          <ScoreColumn score={scoreB} isBetter={better === "b"} />
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreColumn({ score, isBetter }: { score: number; isBetter: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <ScoreCircle score={score} size="lg" />
      {isBetter && <Badge className="bg-emerald-600 text-white">Better Choice</Badge>}
    </div>
  );
}
