"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface Footnote {
  id: number;
  field: string; // pipeline JSON field path
  source: string;
  url?: string;
}

interface FootnoteContextValue {
  register: (field: string, source: string, url?: string) => number;
  footnotes: Footnote[];
}

const FootnoteContext = createContext<FootnoteContextValue>({
  register: () => 0,
  footnotes: [],
});

export function FootnoteProvider({ children }: { children: ReactNode }) {
  const [footnotes, setFootnotes] = useState<Footnote[]>([]);
  const registryRef = useRef<Map<string, number>>(new Map());
  const counterRef = useRef(0);

  const register = useCallback(
    (field: string, source: string, url?: string): number => {
      const existing = registryRef.current.get(field);
      if (existing !== undefined) return existing;

      counterRef.current += 1;
      const id = counterRef.current;
      registryRef.current.set(field, id);
      setFootnotes((prev) => [...prev, { id, field, source, url }]);
      return id;
    },
    []
  );

  return (
    <FootnoteContext.Provider value={{ register, footnotes }}>
      {children}
    </FootnoteContext.Provider>
  );
}

export function useFootnotes() {
  return useContext(FootnoteContext);
}
