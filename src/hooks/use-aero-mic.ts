"use client";

import { useCallback, useRef, useState } from "react";

interface UseAeroMicOptions {
  onTranscript: (text: string) => void;
  onError: (error: string) => void;
}

// Minimal interface covering the Web Speech API surface we use,
// since SpeechRecognition may not be in all TypeScript dom lib versions.
interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start(): void;
  stop(): void;
}

type SRConstructor = new () => ISpeechRecognition;

function getSpeechRecognition(): SRConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as Record<string, unknown>;
  return (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as SRConstructor | undefined;
}

export function useAeroMic({ onTranscript, onError }: UseAeroMicOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const toggle = useCallback(() => {
    const SR = getSpeechRecognition();

    if (!SR) {
      onError("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    try {
      const recognition = new SR();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setIsProcessing(false);
      };

      recognition.onresult = (event) => {
        setIsListening(false);
        setIsProcessing(true);
        const transcript = event.results[0]?.[0]?.transcript ?? "";
        if (transcript.trim()) onTranscript(transcript.trim());
        setIsProcessing(false);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        setIsProcessing(false);
        if (event.error !== "aborted") {
          onError(
            event.error === "not-allowed"
              ? "Microphone access denied."
              : `Speech recognition error: ${event.error}`
          );
        }
      };

      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      onError("Failed to start microphone.");
    }
  }, [isListening, onTranscript, onError]);

  return { isListening, isProcessing, toggle };
}
