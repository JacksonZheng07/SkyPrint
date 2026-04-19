"use client";

import { useRef } from "react";
import { useFootnotes } from "../lib/footnotes";

interface FootnoteRefProps {
  field: string;
  source: string;
  url?: string;
}

/**
 * Renders a superscript footnote number and registers it with the FootnoteStore.
 * Every number on screen should have one of these adjacent to it.
 */
export function FootnoteRef({ field, source, url }: FootnoteRefProps) {
  const { register } = useFootnotes();
  const idRef = useRef<number | null>(null);

  if (idRef.current === null) {
    idRef.current = register(field, source, url);
  }

  return (
    <sup
      className="text-[10px] text-zinc-400 ml-0.5 cursor-help"
      title={`${field} — ${source}`}
      tabIndex={0}
      role="doc-noteref"
      aria-label={`Footnote: ${source}`}
    >
    </sup>
  );
}
