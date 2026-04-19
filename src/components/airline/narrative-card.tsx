"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export function NarrativeCard({ narrative }: { narrative: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <span>🧠</span> AI Analysis
          </h3>
          <p className="leading-relaxed text-muted-foreground">{narrative}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
