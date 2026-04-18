"use client";

import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import type { AeroAction, AeroPageContext, AeroState } from "@/lib/types/aero";

function aeroReducer(state: AeroState, action: AeroAction): AeroState {
  switch (action.type) {
    case "START_LISTENING":
      return { status: "listening" };
    case "START_SPEAKING":
      return { status: "speaking", messageId: action.messageId };
    case "START_EXPLAINING":
      return {
        status: "explaining",
        targetSelector: action.targetSelector,
        messageId: action.messageId,
      };
    case "FINISH":
    case "DISMISS":
      return { status: "idle" };
    default:
      return state;
  }
}

interface AeroContextValue {
  state: AeroState;
  dispatch: (action: AeroAction) => void;
  pageContext: AeroPageContext;
  setPageContext: (ctx: AeroPageContext) => void;
}

const AeroContext = createContext<AeroContextValue | null>(null);

export function AeroProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(aeroReducer, { status: "idle" });
  const [pageContext, setPageContextState] = useReducer(
    (_: AeroPageContext, next: AeroPageContext) => next,
    { page: "generic" } as AeroPageContext
  );

  const setPageContext = useCallback((ctx: AeroPageContext) => {
    setPageContextState(ctx);
  }, []);

  return (
    <AeroContext.Provider value={{ state, dispatch, pageContext, setPageContext }}>
      {children}
    </AeroContext.Provider>
  );
}

export function useAeroState() {
  const ctx = useContext(AeroContext);
  if (!ctx) throw new Error("useAeroState must be used within AeroProvider");
  return ctx;
}
