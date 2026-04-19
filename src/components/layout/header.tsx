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

  const isHome = pathname === "/";

  return (
    <header className={cn(
      "fixed inset-x-0 top-0 z-50 bg-black/20 backdrop-blur-sm"
    )}>
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
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/80 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/profile"
            className="ml-3 inline-flex h-9 items-center justify-center rounded-md border border-white/40 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
