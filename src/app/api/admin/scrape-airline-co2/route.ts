import { NextResponse } from "next/server";
import { scrapeAirlineCo2 } from "@/lib/pipeline/scrape-airline-co2";

/**
 * POST /api/admin/scrape-airline-co2
 *
 * Runs the SerpApi batch scraper across representative routes and returns
 * per-airline CO2 stats including a derived routeOptScore.
 *
 * Use this output to update routeOptScore values in airline-data.ts
 * and mark routeOptSource as "serpapi_aggregate".
 *
 * Requires CRON_SECRET header to prevent accidental triggering.
 */
export async function POST(request: Request) {
  const auth = request.headers.get("x-cron-secret");
  if (auth !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await scrapeAirlineCo2();
    return NextResponse.json({
      scrapedAt: new Date().toISOString(),
      airlineCount: results.length,
      results,
      note: "Use routeOptScore values to update airline-data.ts and set routeOptSource: 'serpapi_aggregate'",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scrape failed" },
      { status: 500 }
    );
  }
}
