"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useMemo } from "react";
import { useAeroState } from "@/components/aero/aero-provider";

export function useAero() {
  const { state, dispatch, pageContext, setPageContext } = useAeroState();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/aero/chat",
        body: { context: pageContext },
      }),
    [pageContext]
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    onFinish: () => {
      dispatch({ type: "FINISH" });
    },
    onError: () => {
      dispatch({ type: "FINISH" });
    },
  });

  const trigger = useCallback(
    (event: string, data?: string) => {
      const triggerMsg = data
        ? `[SYSTEM_TRIGGER:${event}:${data}]`
        : `[SYSTEM_TRIGGER:${event}]`;

      dispatch({ type: "START_SPEAKING", messageId: "trigger" });
      sendMessage({ text: triggerMsg });
    },
    [dispatch, sendMessage]
  );

  const ask = useCallback(
    (question: string) => {
      dispatch({ type: "START_SPEAKING", messageId: "user-ask" });
      sendMessage({ text: question });
    },
    [dispatch, sendMessage]
  );

  const dismiss = useCallback(() => {
    dispatch({ type: "DISMISS" });
  }, [dispatch]);

  const isStreaming = status === "streaming";
  const lastAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

  return {
    state,
    messages,
    lastMessage: lastAssistantMessage,
    isStreaming,
    trigger,
    ask,
    dismiss,
    setPageContext,
    setMessages,
  };
}
