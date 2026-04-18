"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import scrollama from "scrollama";

export type SceneName =
  | "flight"
  | "issr"
  | "receipt"
  | "counterfactual"
  | "context";

const SCENES: SceneName[] = [
  "flight",
  "issr",
  "receipt",
  "counterfactual",
  "context",
];

interface ScrollamaState {
  activeScene: SceneName;
  progress: number; // 0–1 within current scene
  direction: "up" | "down";
}

export function useScrollama() {
  const [state, setState] = useState<ScrollamaState>({
    activeScene: "flight",
    progress: 0,
    direction: "down",
  });
  const scrollerRef = useRef<ReturnType<typeof scrollama> | null>(null);

  const init = useCallback(() => {
    if (scrollerRef.current) scrollerRef.current.destroy();

    const scroller = scrollama();
    scrollerRef.current = scroller;

    scroller
      .setup({
        step: ".scene-waypoint",
        offset: 0.5,
        progress: true,
      })
      .onStepEnter(
        (response: { index: number; direction: "up" | "down" }) => {
          setState((prev) => ({
            ...prev,
            activeScene: SCENES[response.index] ?? "flight",
            direction: response.direction,
          }));
        }
      )
      .onStepProgress(
        (response: { index: number; progress: number }) => {
          setState((prev) => ({
            ...prev,
            progress: response.progress,
          }));
        }
      );
  }, []);

  useEffect(() => {
    init();
    const handleResize = () => scrollerRef.current?.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      scrollerRef.current?.destroy();
      window.removeEventListener("resize", handleResize);
    };
  }, [init]);

  return state;
}
