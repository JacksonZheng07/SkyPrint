"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/compare", label: "Purchase Flights" },
  { href: "/simulate", label: "Simulate" },
  { href: "/airlines", label: "Airlines", matchPrefix: "/airline" },
  { href: "/playground", label: "Playground" },
  { href: "/mission", label: "About" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className={cn(
      "fixed inset-x-0 top-0 z-50 bg-black/20 backdrop-blur-sm"
    )}>
      <style>{`
        @keyframes aurora-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(45,212,191,0.5), 0 0 20px rgba(45,212,191,0.25), 0 0 40px rgba(45,212,191,0.1); }
          50%       { box-shadow: 0 0 12px rgba(45,212,191,0.7), 0 0 30px rgba(45,212,191,0.35), 0 0 60px rgba(45,212,191,0.15); }
        }
        .playground-active { animation: aurora-pulse 2.5s ease-in-out infinite; }
      `}</style>
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 overflow-hidden rounded-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/planeLogo.png" alt="SkyPrint logo" className="h-full w-full scale-[1.5] translate-y-[7px] translate-x-[2px] object-cover object-center" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">SkyPrint</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.matchPrefix
              ? pathname.startsWith(item.matchPrefix)
              : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive && item.href === "/playground"
                    ? "playground-active text-teal-300 border border-teal-400/40 bg-teal-500/10"
                    : isActive
                    ? "bg-white/15 text-white"
                    : "text-white/80 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
