"use client";

import type { SceneName } from "../hooks/useScrollama";
import type { FlightAnalysis } from "../lib/types";
import { FlightScene } from "./scenes/flight-scene";
import { IssrScene } from "./scenes/issr-scene";
import { ReceiptScene } from "./scenes/receipt-scene";
import { CounterfactualScene } from "./scenes/counterfactual-scene";
import { ContextScene } from "./scenes/context-scene";

interface SceneTextProps {
  scene: SceneName;
  data: FlightAnalysis;
}

export function SceneText({ scene, data }: SceneTextProps) {
  switch (scene) {
    case "flight":
      return <FlightScene data={data} />;
    case "issr":
      return <IssrScene data={data} />;
    case "receipt":
      return <ReceiptScene data={data} />;
    case "counterfactual":
      return <CounterfactualScene data={data} />;
    case "context":
      return <ContextScene data={data} />;
    default:
      return null;
  }
}
