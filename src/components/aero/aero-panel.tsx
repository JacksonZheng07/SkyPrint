"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { UIMessage } from "ai";
import { useAero } from "@/hooks/use-aero";
import { useAeroVoice } from "@/hooks/use-aero-voice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AeroPanelProps {
  lastMessage: UIMessage | undefined;
  isStreaming: boolean;
  onClose: () => void;
}

export function AeroPanel({ lastMessage, isStreaming, onClose }: AeroPanelProps) {
  const { ask, messages } = useAero();
  const { speak, stop, isPlaying } = useAeroVoice();
  const [input, setInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim()) {
      ask(input.trim());
      setInput("");
    }
  }

  const lastText =
    lastMessage?.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("") ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-24 right-6 z-50 flex w-80 flex-col rounded-2xl border bg-background shadow-xl sm:w-96"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium">Aero</span>
          <span className="text-xs text-muted-foreground">Climate Guide</span>
        </div>
        <div className="flex gap-1">
          {lastText && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-xs"
              onClick={() => (isPlaying ? stop() : speak(lastText))}
              title={isPlaying ? "Stop" : "Listen"}
            >
              {isPlaying ? "◼" : "🔊"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-xs"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="max-h-64 overflow-y-auto px-4 py-3 space-y-3">
        {messages
          .filter((m) => m.role === "assistant")
          .slice(-3)
          .map((msg) => (
            <div key={msg.id} className="text-sm leading-relaxed">
              {msg.parts
                ?.filter(
                  (p): p is { type: "text"; text: string } => p.type === "text"
                )
                .map((p, i) => (
                  <p key={i}>{p.text}</p>
                ))}
            </div>
          ))}

        {isStreaming && (
          <div className="flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-sky-400 [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-sky-400 [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-sky-400 [animation-delay:300ms]" />
          </div>
        )}

        {messages.length === 0 && !isStreaming && (
          <p className="text-sm text-muted-foreground">
            Hi! I&apos;m Aero, your climate aviation guide. Ask me about contrails,
            flight emissions, or anything about your comparison.
          </p>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t px-4 py-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about contrails..."
          className="h-8 text-sm"
          disabled={isStreaming}
        />
        <Button
          type="submit"
          size="sm"
          className="h-8"
          disabled={isStreaming || !input.trim()}
        >
          Ask
        </Button>
      </form>
    </motion.div>
  );
}
