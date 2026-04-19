"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import type { AirlineScore } from "@/lib/types/airline";
import { CATEGORY_META, type CategoryKey } from "@/lib/utils/airline-categories";
import { categoryTextColor, categoryGradientBar } from "@/lib/utils/grades";

export function CategoryGrid({ categories }: { categories: AirlineScore["categories"] }) {
  const entries = Object.entries(categories) as [CategoryKey, number][];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {entries.map(([key, value], i) => (
        <CategoryCard key={key} meta={CATEGORY_META[key]} value={value} order={i} />
      ))}
    </div>
  );
}

interface CategoryCardProps {
  meta: (typeof CATEGORY_META)[CategoryKey];
  value: number;
  order: number;
}

function CategoryCard({ meta, value, order }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + order * 0.1 }}
    >
      <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-2xl">{meta.icon}</span>
              <h4 className="mt-1 font-semibold">{meta.label}</h4>
              <p className="text-xs text-muted-foreground">{meta.description}</p>
            </div>
            <span className={`text-2xl font-bold ${categoryTextColor(value)}`}>{value}</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className={`h-full rounded-full ${categoryGradientBar(value)}`}
              initial={{ width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{ duration: 0.8, delay: 0.3 + order * 0.1 }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
