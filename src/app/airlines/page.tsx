"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { PodiumCard } from "@/components/airline/podium-card";
import { RankingRow } from "@/components/airline/ranking-row";
import type { AirlineScore } from "@/lib/types/airline";

export default function AirlinesPage() {
  const [scores, setScores] = useState<AirlineScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rankings")
      .then((r) => r.json())
      .then(setScores)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingState />;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <PageHeader />
      {scores.length >= 3 && <Podium scores={scores} />}
      <FullRankings scores={scores} />
      <FunFactCard />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Loading airline rankings...</p>
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <h1 className="text-4xl font-bold tracking-tight">✈️ Airline Climate Rankings</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Who&apos;s leading the charge for cleaner skies?
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Rankings based on fleet efficiency, route optimization, contrail mitigation, and sustainable
        fuel adoption.
      </p>
    </motion.div>
  );
}

function Podium({ scores }: { scores: AirlineScore[] }) {
  // Visual order: 2nd place (left), 1st place (center/raised), 3rd place (right)
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <PodiumCard airline={scores[1]} rank={1} />
      <PodiumCard airline={scores[0]} rank={0} />
      <PodiumCard airline={scores[2]} rank={2} />
    </div>
  );
}

function FullRankings({ scores }: { scores: AirlineScore[] }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Full Rankings</h2>
      {scores.map((airline, i) => (
        <RankingRow key={airline.airlineCode} airline={airline} index={i} />
      ))}
    </div>
  );
}

function FunFactCard() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <h3 className="mb-2 text-lg font-semibold">💡 Did You Know?</h3>
          <p className="text-sm text-muted-foreground">
            If all airlines adopted contrail-aware flight planning, we could eliminate up to{" "}
            <span className="font-bold text-foreground">35%</span> of aviation&apos;s total warming
            effect with less than <span className="font-bold text-foreground">1%</span> increase in
            fuel costs. That&apos;s the equivalent of planting{" "}
            <span className="font-bold text-green-500">billions of trees</span> every year.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
