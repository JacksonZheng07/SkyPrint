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
      "0 0 8px rgba(0, 255, 255, 0.4), 0 0 20px rgba(56, 189, 248, 0.3), 0 0 30px rgba(139, 92, 246, 0.15)",
      "0 0 12px rgba(139, 92, 246, 0.4), 0 0 24px rgba(0, 255, 255, 0.3), 0 0 35px rgba(56, 189, 248, 0.2)",
      "0 0 8px rgba(56, 189, 248, 0.4), 0 0 20px rgba(139, 92, 246, 0.3), 0 0 30px rgba(0, 255, 255, 0.15)",
    ],
    transition: { repeat: Infinity, duration: 3, ease: "easeInOut" as const },
  },
  listening: {
    scale: [1, 1.04, 1],
    boxShadow: "0 0 14px rgba(0, 255, 255, 0.5), 0 0 28px rgba(139, 92, 246, 0.35)",
    transition: { repeat: Infinity, duration: 0.8 },
  },
  speaking: {
    scale: [1, 1.03, 0.98, 1],
    boxShadow: "0 0 12px rgba(139, 92, 246, 0.5), 0 0 24px rgba(0, 255, 255, 0.3)",
    transition: { repeat: Infinity, duration: 0.6 },
  },
  explaining: {
    scale: 0.97,
    boxShadow: "0 0 10px rgba(0, 255, 255, 0.4), 0 0 20px rgba(56, 189, 248, 0.3)",
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
          className="aero-ring-wrapper"
          variants={orbVariants}
          animate={state.status}
        >
          <div className="relative z-10 h-12 w-12 overflow-hidden rounded-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/AeroImage.png" alt="Aero" className="h-full w-full scale-[1.95] translate-y-[4px] rounded-full object-cover" />
          </div>
        </motion.div>

        {isStreaming && (
          <motion.div
            className="absolute h-14 w-14 rounded-full border-2 border-cyan-400/50"
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
