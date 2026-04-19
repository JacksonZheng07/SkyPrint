"use client";

import { useState } from "react";
import { motion, useDragControls } from "framer-motion";
import { GripVertical, Mic, MicOff, Volume2, VolumeX, X, Loader2 } from "lucide-react";
import type { UIMessage } from "ai";
import { useAero } from "@/hooks/use-aero";
import { useAeroVoice } from "@/hooks/use-aero-voice";
import { useAeroMic } from "@/hooks/use-aero-mic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AeroPanelProps {
  lastMessage: UIMessage | undefined;
  isStreaming: boolean;
  onClose: () => void;
}

export function AeroPanel({ lastMessage, isStreaming, onClose }: AeroPanelProps) {
  const { ask, messages } = useAero();
  const { speak, stop: stopSpeaking, isPlaying } = useAeroVoice();
  const [input, setInput] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const dragControls = useDragControls();

  const { isListening, isProcessing, toggle: toggleMic } = useAeroMic({
    onTranscript: (text) => {
      setInput("");
      ask(text);
    },
    onError: (err) => {
      setMicError(err);
      setTimeout(() => setMicError(null), 3000);
    },
  });

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
      drag
      dragMomentum={false}
      dragElastic={0}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={{ top: -600, left: -1200, right: 100, bottom: 100 }}
      className="fixed bottom-24 right-6 z-50 flex w-80 flex-col rounded-2xl border bg-background shadow-xl sm:w-96"
    >
      {/* Header (drag handle) */}
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="flex cursor-grab items-center justify-between border-b px-4 py-3 active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium">Aero</span>
          <span className="text-xs text-muted-foreground">Climate Guide</span>
        </div>
        <div className="flex gap-1">
          {lastText && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => (isPlaying ? stopSpeaking() : speak(lastText))}
              title={isPlaying ? "Stop audio" : "Listen"}
            >
              {isPlaying ? (
                <VolumeX className="h-3.5 w-3.5" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
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

        {/* Voice status feedback */}
        {isListening && (
          <div className="flex items-center gap-2 text-xs text-red-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            Listening... tap mic to stop
          </div>
        )}
        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Transcribing...
          </div>
        )}
        {micError && (
          <p className="text-xs text-destructive">{micError}</p>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t px-4 py-3"
      >
        {/* Mic toggle */}
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={toggleMic}
          disabled={isStreaming || isProcessing}
          title={isListening ? "Stop recording" : "Speak to Aero"}
        >
          {isProcessing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isListening ? (
            <MicOff className="h-3.5 w-3.5" />
          ) : (
            <Mic className="h-3.5 w-3.5" />
          )}
        </Button>

        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening..." : "Ask about contrails..."}
          className="h-8 text-sm"
          disabled={isStreaming || isListening || isProcessing}
        />
        <Button
          type="submit"
          size="sm"
          className="h-8"
          disabled={isStreaming || !input.trim() || isListening || isProcessing}
        >
          Ask
        </Button>
      </form>
    </motion.div>
  );
}
