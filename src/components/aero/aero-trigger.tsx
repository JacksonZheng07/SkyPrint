"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAero } from "@/hooks/use-aero";
import type { FlightComparison } from "@/lib/types/comparison";

interface AeroTriggerProps {
  comparison?: FlightComparison | null;
}

export function AeroTrigger({ comparison }: AeroTriggerProps) {
  const { trigger, setPageContext } = useAero();
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const hasTriggered = useRef(false);

  // Update page context when comparison data changes
  useEffect(() => {
    if (comparison) {
      setPageContext({ page: "compare", flights: comparison });
    }
  }, [comparison, setPageContext]);

  // Trigger when user navigates to /compare with data
  useEffect(() => {
    if (
      pathname === "/compare" &&
      comparison &&
      comparison.flights.length > 0 &&
      !hasTriggered.current
    ) {
      hasTriggered.current = true;
      // Small delay to let the UI render first
      const timeout = setTimeout(() => {
        trigger("compare_opened");
      }, 1500);
      return () => clearTimeout(timeout);
    }

    if (pathname !== prevPathname.current) {
      hasTriggered.current = false;
      prevPathname.current = pathname;
    }
  }, [pathname, comparison, trigger]);

  return null; // Invisible component
}
