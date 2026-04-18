"use client";

import { useFootnotes } from "../lib/footnotes";

/**
 * Renders the full list of footnotes at the bottom of the page.
 * Each entry shows the pipeline field, source, and optional URL.
 */
export function FootnotesSection() {
  const { footnotes } = useFootnotes();

  if (footnotes.length === 0) return null;

  return (
    <section
      className="max-w-3xl mx-auto px-6 py-12 border-t border-zinc-800"
      aria-label="Footnotes"
    >
      <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
        Sources and Citations
      </h2>
      <ol className="space-y-2 text-xs text-zinc-500">
        {footnotes.map((fn) => (
          <li key={fn.id} id={`fn-${fn.id}`} className="leading-relaxed">
            <span className="text-zinc-400 font-mono">[{fn.id}]</span>{" "}
            <span className="text-zinc-500 font-mono">{fn.field}</span>
            {" — "}
            {fn.source}
            {fn.url && (
              <>
                {" "}
                <a
                  href={fn.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  {fn.url}
                </a>
              </>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
