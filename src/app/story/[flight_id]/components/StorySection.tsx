import type { SceneName } from "../hooks/useScrollama";
import type { ReactNode } from "react";

interface StorySectionProps {
  scene: SceneName;
  className?: string;
  children: ReactNode;
}

const SCENE_SECTION_CLASSES: Record<SceneName, string> = {
  flight: "min-h-screen flex items-end pb-24",
  issr: "min-h-screen flex items-center",
  receipt: "min-h-[120vh] flex flex-col justify-center",
  counterfactual: "min-h-screen flex items-center",
  context: "min-h-screen flex items-center",
};

const SCENE_CARD_CLASSES: Record<SceneName, string> = {
  flight: "bg-zinc-950/80",
  issr: "bg-zinc-950/80",
  receipt: "bg-zinc-950/80 space-y-6",
  counterfactual: "bg-zinc-950/80",
  context: "bg-zinc-950/90 space-y-6",
};

export function StorySection({ scene, className = "", children }: StorySectionProps) {
  return (
    <section
      className={`scene-waypoint px-6 sm:px-12 ${SCENE_SECTION_CLASSES[scene]} ${className}`}
      data-scene={scene}
    >
      <div className={`max-w-xl backdrop-blur-sm rounded-lg p-6 ${SCENE_CARD_CLASSES[scene]}`}>
        {children}
      </div>
    </section>
  );
}
