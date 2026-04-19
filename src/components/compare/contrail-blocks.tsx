"use client";

interface ContrailBlocksProps {
  score: number; // 0-100
  size?: "sm" | "md";
}

export function ContrailBlocks({ score, size = "sm" }: ContrailBlocksProps) {
  const totalBlocks = 5;
  const filledBlocks = Math.min(totalBlocks, Math.ceil(score / 20));

  const blockColor =
    score <= 33
      ? "bg-emerald-500"
      : score <= 66
        ? "bg-amber-400"
        : "bg-red-500";

  const dim = size === "md" ? "h-5 w-3" : "h-4 w-2.5";

  return (
    <div className="flex items-center gap-0.5" title={`Contrail Impact: ${score}/100`}>
      {Array.from({ length: totalBlocks }, (_, i) => (
        <div
          key={i}
          className={`rounded-sm ${dim} ${
            i < filledBlocks ? blockColor : "bg-muted"
          }`}
        />
      ))}
    </div>
  );
}
