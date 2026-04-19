import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <p className="text-sm font-medium">SkyPrint</p>
            <p className="text-xs text-muted-foreground">
              Clean aviation intelligence. Carbon transparency at every altitude.
            </p>
          </div>
          <nav className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/compare" className="hover:text-foreground">
              Purchase Flights
            </Link>
            <Link href="/simulate" className="hover:text-foreground">
              Simulate
            </Link>
            <Link href="/airlines" className="hover:text-foreground">
              Airlines
            </Link>
            <Link href="/dashboard" className="hover:text-foreground">
              Impact
            </Link>
            <Link href="/trips" className="hover:text-foreground">
              My Trips
            </Link>
            <Link href="/mission" className="hover:text-foreground">
              About
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
