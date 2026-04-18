"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAero } from "@/hooks/use-aero";
import { AeroPanel } from "./aero-panel";

const orbVariants = {
  idle: {
    scale: [1, 1.05, 1],
    boxShadow: [
      "0 0 20px rgba(56, 189, 248, 0.3)",
      "0 0 30px rgba(56, 189, 248, 0.5)",
      "0 0 20px rgba(56, 189, 248, 0.3)",
    ],
    transition: { repeat: Infinity, duration: 3, ease: "easeInOut" as const },
  },
  listening: {
    scale: [1, 1.1, 1],
    boxShadow: "0 0 40px rgba(56, 189, 248, 0.6)",
    transition: { repeat: Infinity, duration: 0.8 },
  },
  speaking: {
    scale: [1, 1.08, 0.96, 1],
    boxShadow: "0 0 35px rgba(139, 92, 246, 0.5)",
    transition: { repeat: Infinity, duration: 0.6 },
  },
  explaining: {
    scale: 0.85,
    boxShadow: "0 0 25px rgba(34, 197, 94, 0.5)",
    transition: { duration: 0.3 },
  },
};

export function AeroOrb() {
  const { state, lastMessage, isStreaming, dismiss } = useAero();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

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
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-violet-500"
          variants={orbVariants}
          animate={state.status}
        >
          <span className="text-lg font-bold text-white">A</span>
        </motion.div>

        {isStreaming && (
          <motion.div
            className="absolute h-14 w-14 rounded-full border-2 border-sky-400"
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
