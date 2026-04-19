"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FlightAnalysis } from "../lib/types";
import { loadFlightData, loadISSRGeoJSON } from "../lib/data";
import { simplifyTrack } from "../lib/simplify";
import { FootnoteProvider } from "../lib/footnotes";
import { useScrollama, type SceneName } from "../hooks/useScrollama";
import { useMapAnimation } from "../hooks/useMapAnimation";
import FlightMap, { type FlightMapHandle } from "./FlightMap";
import { SceneText } from "./SceneText";
import { ReceiptChart } from "./ReceiptChart";
import { LeaderboardChart } from "./LeaderboardChart";
import { FootnotesSection } from "./FootnotesSection";
import { ErrorBoundary } from "./ErrorBoundary";
import { StorySection } from "./StorySection";

interface StoryPageProps {
  flightId: string;
}

function resolveIssrPath(rawPath: string): string {
  return rawPath.startsWith("/") ? rawPath : `/data/${rawPath}`;
}

function useStoryData(flightId: string) {
  const [data, setData] = useState<FlightAnalysis | null>(null);
  const [issrGeojson, setIssrGeojson] = useState<GeoJSON.FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const flight = await loadFlightData(flightId);
      if (cancelled) return;
      if (!flight) {
        setError(`Pipeline output not found. Expected: /data/${flightId}.json`);
        setLoading(false);
        return;
      }
      setData(flight);
      const issr = await loadISSRGeoJSON(resolveIssrPath(flight.issr_geojson_path));
      if (!cancelled) setIssrGeojson(issr);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [flightId]);

  return { data, issrGeojson, loading, error };
}

export default function StoryPage({ flightId }: StoryPageProps) {
  const { data, issrGeojson, loading, error } = useStoryData(flightId);
  const { activeScene } = useScrollama(!loading && !!data);

  if (loading) return <StoryLoading />;
  if (error || !data) return <StoryError flightId={flightId} error={error} />;

  return (
    <ErrorBoundary flightId={flightId}>
      <FootnoteProvider>
        <StoryLayout data={data} issrGeojson={issrGeojson} activeScene={activeScene} />
      </FootnoteProvider>
    </ErrorBoundary>
  );
}

interface StoryLayoutProps {
  data: FlightAnalysis;
  issrGeojson: GeoJSON.FeatureCollection | null;
  activeScene: SceneName;
}

function StoryLayout({ data, issrGeojson, activeScene }: StoryLayoutProps) {
  const mapRef = useRef<FlightMapHandle>(null);
  const { animateTrack } = useMapAnimation();
  const animatedRef = useRef(false);
  const issrShownRef = useRef(false);
  const counterfactualShownRef = useRef(false);
  const counterfactualPreloadedRef = useRef(false);
  const activeSceneRef = useRef<SceneName>("flight");
  const exploreFirstRunRef = useRef(true);

  const [cfToggleOn, setCfToggleOn] = useState(false);
  const [exploreMode, setExploreMode] = useState(false);

  useEffect(() => {
    activeSceneRef.current = activeScene;
  }, [activeScene]);

  useEffect(() => {
    if (exploreFirstRunRef.current) {
      exploreFirstRunRef.current = false;
      return;
    }
    if (!exploreMode) {
      mapRef.current?.updateForScene(activeSceneRef.current);
      window.dispatchEvent(new Event("resize"));
    }
  }, [exploreMode]);

  const handleSceneChange = useCallback(
    (scene: SceneName) => {
      const handle = mapRef.current;
      if (!handle) return;

      if (
        !counterfactualPreloadedRef.current &&
        data.track_counterfactual?.length
      ) {
        counterfactualPreloadedRef.current = true;
        handle.preloadCounterfactual(data.track_counterfactual);
      }

      handle.updateForScene(scene);
      setCfToggleOn(scene === "counterfactual");

      if (scene === "flight" && !animatedRef.current) {
        animatedRef.current = true;
        const map = handle.getMap();
        if (map) {
          animateTrack(map, simplifyTrack(data.track_actual), () => {
            handle.showFullTrack(data.track_actual);
          });
        }
      }
      if (scene === "issr" && !issrShownRef.current) {
        issrShownRef.current = true;
        handle.showFullTrack(data.track_actual);
        if (issrGeojson) handle.showISSR(issrGeojson);
      }
      if (scene === "counterfactual" && !counterfactualShownRef.current) {
        counterfactualShownRef.current = true;
        handle.showCounterfactual(data.track_counterfactual);
      }
    },
    [data, issrGeojson, animateTrack],
  );

  useEffect(() => {
    handleSceneChange(activeScene);
  }, [activeScene, handleSceneChange]);

  const mapOpacity = activeScene === "context" ? "opacity-30" : "opacity-100";

  return (
    <div className="relative bg-zinc-950 text-white min-h-screen">
      <div className="fixed top-20 right-4 z-50 flex gap-2">
        <button
          onClick={() => setExploreMode((v) => !v)}
          className="px-3 py-1.5 text-xs font-medium bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 rounded text-white backdrop-blur-sm transition-colors"
        >
          {exploreMode ? "Exit explore" : "Explore globe"}
        </button>
        <button
          onClick={() => {
            const next = !cfToggleOn;
            mapRef.current?.setCounterfactualVisible(next);
            setCfToggleOn(next);
          }}
          className="px-3 py-1.5 text-xs font-medium bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 rounded text-white backdrop-blur-sm transition-colors"
        >
          {cfToggleOn ? "Hide" : "Show"} alternative route
        </button>
      </div>

      <div className={`sticky top-0 h-screen w-full transition-opacity duration-700 ${mapOpacity}`}>
        <FlightMap ref={mapRef} />
      </div>

      <div
        className="relative z-10 -mt-[100vh]"
        style={exploreMode ? { display: "none" } : undefined}
      >
        <StorySection scene="flight">
          <SceneText scene="flight" data={data} />
        </StorySection>
        <StorySection scene="issr">
          <SceneText scene="issr" data={data} />
        </StorySection>
        <StorySection scene="receipt">
          <SceneText scene="receipt" data={data} />
          <ReceiptChart data={data} />
        </StorySection>
        <StorySection scene="counterfactual">
          <SceneText scene="counterfactual" data={data} />
        </StorySection>
        <StorySection scene="context">
          <SceneText scene="context" data={data} />
          {data.airline_context.flights_analyzed >= 30 && <LeaderboardChart data={data} />}
        </StorySection>
        <section className="min-h-[50vh] px-6 sm:px-12 py-20 bg-zinc-950">
          <div className="max-w-2xl">
            <FootnotesSection />
          </div>
        </section>
      </div>
    </div>
  );
}

function StoryLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-zinc-400 text-sm animate-pulse">Loading pipeline data…</div>
    </div>
  );
}

function StoryError({ flightId, error }: { flightId: string; error: string | null }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-300 p-8">
      <div className="max-w-md space-y-4">
        <h1 className="text-xl font-semibold text-white">Pipeline output not found</h1>
        <p className="text-sm">
          Expected:{" "}
          <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded font-mono">
            /data/{flightId}.json
          </code>
        </p>
        {error && <p className="text-xs text-zinc-500 font-mono">{error}</p>}
      </div>
    </div>
  );
}
