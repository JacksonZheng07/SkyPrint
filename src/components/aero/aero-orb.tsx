"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAero } from "@/hooks/use-aero";
import { AeroPanel } from "./aero-panel";

const orbVariants = {
  idle: {
    scale: [1, 1.03, 1],
    boxShadow: [
      "0 0 6px rgba(30, 64, 175, 0.3), 0 0 12px rgba(56, 189, 248, 0.15)",
      "0 0 10px rgba(30, 64, 175, 0.4), 0 0 20px rgba(56, 189, 248, 0.25)",
      "0 0 6px rgba(30, 64, 175, 0.3), 0 0 12px rgba(56, 189, 248, 0.15)",
    ],
    transition: { repeat: Infinity, duration: 3, ease: "easeInOut" as const },
  },
  listening: {
    scale: [1, 1.04, 1],
    boxShadow: "0 0 12px rgba(30, 64, 175, 0.4), 0 0 20px rgba(56, 189, 248, 0.3)",
    transition: { repeat: Infinity, duration: 0.8 },
  },
  speaking: {
    scale: [1, 1.03, 0.98, 1],
    boxShadow: "0 0 10px rgba(30, 64, 175, 0.35), 0 0 16px rgba(56, 189, 248, 0.2)",
    transition: { repeat: Infinity, duration: 0.6 },
  },
  explaining: {
    scale: 0.97,
    boxShadow: "0 0 8px rgba(30, 64, 175, 0.3), 0 0 14px rgba(56, 189, 248, 0.2)",
    transition: { duration: 0.3 },
  },
};

export function AeroOrb() {
  const pathname = usePathname();
  const { state, lastMessage, isStreaming, dismiss } = useAero();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  if (pathname === "/") return null;

  const showPanel =
    isPanelOpen || state.status === "speaking" || state.status === "explaining";

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50 flex cursor-pointer items-center justify-center"
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full ring-2 ring-blue-900/60"
          variants={orbVariants}
          animate={state.status}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/AeroImage.png" alt="Aero" className="h-full w-full scale-[2] -translate-y-[3px] rounded-full object-cover" />
        </motion.div>

        {isStreaming && (
          <motion.div
            className="absolute h-12 w-12 rounded-full border-2 border-blue-800/50"
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </motion.div>

      <AnimatePresence>
        {showPanel && (
          <AeroPanel
            lastMessage={lastMessage}
            isStreaming={isStreaming}
            onClose={() => {
              setIsPanelOpen(false);
              dismiss();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
