"use client";

import { useCallback, useRef, useState } from "react";

interface UseAeroMicOptions {
  onTranscript: (text: string) => void;
  onError?: (err: string) => void;
}

export function useAeroMic({ onTranscript, onError }: UseAeroMicOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsListening(false);
        setIsProcessing(true);

        const blob = new Blob(chunksRef.current, { type: mimeType });
        const ext = mimeType === "audio/webm" ? "webm" : "mp4";
        const formData = new FormData();
        formData.append("audio", blob, `audio.${ext}`);

        try {
          const res = await fetch("/api/aero/transcribe", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data.text?.trim()) {
            onTranscript(data.text.trim());
          } else {
            onError?.("No speech detected.");
          }
        } catch {
          onError?.("Transcription failed.");
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsListening(true);
    } catch {
      onError?.("Microphone access denied.");
      setIsListening(false);
    }
  }, [onTranscript, onError]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  return { isListening, isProcessing, toggle };
}
