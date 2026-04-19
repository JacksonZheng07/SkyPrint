"use client";

import { useRef, useState } from "react";
import { useFootnotes } from "../lib/footnotes";

interface FootnoteRefProps {
  field: string;
  source: string;
  url?: string;
  equation?: string;
}

export function FootnoteRef({ field, source, url, equation }: FootnoteRefProps) {
  const { register } = useFootnotes();
  const idRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);

  if (idRef.current === null) {
    idRef.current = register(field, source, url);
  }

  return (
    <span className="relative inline-block ml-0.5 align-super">
      <button
        className="inline-flex items-center justify-center rounded px-[3px] py-[1px] font-mono text-[9px] font-semibold tracking-tight text-teal-400 ring-1 ring-teal-400/40 bg-teal-400/[0.08] leading-none hover:bg-teal-400/20 transition-colors"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-label={`Footnote: ${source}`}
        role="doc-noteref"
      >
        ƒ
      </button>

      {open && (
        <>
          {/* backdrop to close */}
          <span
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <span className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-xl border border-teal-400/25 bg-zinc-900/95 p-3 shadow-2xl backdrop-blur-md">
            {equation && (
              <span className="block mb-2 rounded-lg bg-black/40 px-3 py-2 font-mono text-[11px] leading-relaxed text-teal-300 whitespace-pre">
                {equation}
              </span>
            )}
            <span className="block text-[10px] text-zinc-400 leading-snug">
              <span className="font-medium text-zinc-300">{field}</span>
              <br />
              {source}
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-teal-500 hover:text-teal-400 truncate"
                >
                  {url}
                </a>
              )}
            </span>
          </span>
        </>
      )}
    </span>
  );
}
