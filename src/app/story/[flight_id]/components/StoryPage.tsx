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

interface StoryPageProps {
  flightId: string;
}

export default function StoryPage({ flightId }: StoryPageProps) {
  const [data, setData] = useState<FlightAnalysis | null>(null);
  const [issrGeojson, setIssrGeojson] =
    useState<GeoJSON.FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cfToggleOn, setCfToggleOn] = useState(false);
  const [exploreMode, setExploreMode] = useState(false);

  const mapRef = useRef<FlightMapHandle>(null);
  const { activeScene, progress, direction } = useScrollama(!loading && !!data);
  const { animateTrack, stopAnimation } = useMapAnimation();

  const animatedRef = useRef(false);
  const issrShownRef = useRef(false);
  const counterfactualShownRef = useRef(false);
  const counterfactualPreloadedRef = useRef(false);
  const prevSceneRef = useRef<SceneName>("flight");
  const activeSceneRef = useRef<SceneName>("flight");
  const exploreFirstRunRef = useRef(true);

  // Track activeScene in a ref so the explore-mode effect can read it without re-subscribing
  useEffect(() => {
    activeSceneRef.current = activeScene;
  }, [activeScene]);

  // On exit from explore mode, restore scene-driven camera + layers
  useEffect(() => {
    if (exploreFirstRunRef.current) {
      exploreFirstRunRef.current = false;
      return;
    }
    if (!exploreMode) {
      mapRef.current?.updateForScene(activeSceneRef.current);
      // Let scrollama recompute positions after the overlay comes back
      window.dispatchEvent(new Event("resize"));
    }
  }, [exploreMode]);

  // --- Data loading ---
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const flight = await loadFlightData(flightId);
      if (cancelled) return;
      if (!flight) {
        setError(
          `Pipeline output not found. Expected: /data/${flightId}.json`
        );
        setLoading(false);
        return;
      }
      setData(flight);

      // Load ISSR GeoJSON (path comes from pipeline data)
      const geojsonPath = flight.issr_geojson_path.startsWith("/")
        ? flight.issr_geojson_path
        : `/data/${flight.issr_geojson_path}`;
      const issr = await loadISSRGeoJSON(geojsonPath);
      if (!cancelled) setIssrGeojson(issr);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [flightId]);

  // --- Scene transitions ---
  const handleSceneChange = useCallback(
    (scene: SceneName) => {
      if (!data || !mapRef.current) return;
      const handle = mapRef.current;

      // Preload counterfactual once so the manual toggle works before scene 4
      if (
        !counterfactualPreloadedRef.current &&
        data.track_counterfactual?.length
      ) {
        counterfactualPreloadedRef.current = true;
        handle.preloadCounterfactual(data.track_counterfactual);
      }

      // Update map state for scene
      handle.updateForScene(scene);

      // Sync button label with scene-driven visibility
      setCfToggleOn(scene === "counterfactual");

      if (scene === "flight" && !animatedRef.current) {
        animatedRef.current = true;
        const map = handle.getMap();
        if (map) {
          const simplified = simplifyTrack(data.track_actual);
          animateTrack(map, simplified, () => {
            handle.showFullTrack(data.track_actual);
          });
        }
      }

      if (scene === "issr" && !issrShownRef.current) {
        issrShownRef.current = true;
        handle.showFullTrack(data.track_actual);
        if (issrGeojson) {
          handle.showISSR(issrGeojson);
        }
      }

      if (scene === "counterfactual" && !counterfactualShownRef.current) {
        counterfactualShownRef.current = true;
        handle.showCounterfactual(data.track_counterfactual);
      }

      prevSceneRef.current = scene;
    },
    [data, issrGeojson, animateTrack]
  );

  useEffect(() => {
    handleSceneChange(activeScene);
  }, [activeScene, handleSceneChange]);

  // --- Loading state ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-zinc-400 text-sm animate-pulse">
          Loading pipeline data…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-300 p-8">
        <div className="max-w-md space-y-4">
          <h1 className="text-xl font-semibold text-white">
            Pipeline output not found
          </h1>
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

  const mapOpacity =
    activeScene === "context" ? "opacity-30" : "opacity-100";

  return (
    <ErrorBoundary flightId={flightId}>
      <FootnoteProvider>
        <div className="relative bg-zinc-950 text-white min-h-screen">
          {/* Floating map controls (below the app header at z-40) */}
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

          {/* Sticky map background */}
          <div
            className={`sticky top-0 h-screen w-full transition-opacity duration-700 ${mapOpacity}`}
          >
            <FlightMap ref={mapRef} />
          </div>

          {/* Scrolling text overlay */}
          <div
            className="relative z-10 -mt-[100vh]"
            style={exploreMode ? { display: "none" } : undefined}
          >
            {/* Scene 1: The Flight */}
            <section
              className="scene-waypoint min-h-screen flex items-end pb-24 px-6 sm:px-12"
              data-scene="flight"
            >
              <div className="max-w-xl bg-zinc-950/80 backdrop-blur-sm rounded-lg p-6">
                <SceneText scene="flight" data={data} />
              </div>
            </section>

            {/* Scene 2: The Invisible Layer */}
            <section
              className="scene-waypoint min-h-screen flex items-center px-6 sm:px-12"
              data-scene="issr"
            >
              <div className="max-w-xl bg-zinc-950/80 backdrop-blur-sm rounded-lg p-6">
                <SceneText scene="issr" data={data} />
              </div>
            </section>

            {/* Scene 3: The Receipt */}
            <section
              className="scene-waypoint min-h-[120vh] flex flex-col justify-center px-6 sm:px-12"
              data-scene="receipt"
            >
              <div className="max-w-xl bg-zinc-950/80 backdrop-blur-sm rounded-lg p-6 space-y-6">
                <SceneText scene="receipt" data={data} />
                <ReceiptChart data={data} />
              </div>
            </section>

            {/* Scene 4: The Counterfactual */}
            <section
              className="scene-waypoint min-h-screen flex items-center px-6 sm:px-12"
              data-scene="counterfactual"
            >
              <div className="max-w-xl bg-zinc-950/80 backdrop-blur-sm rounded-lg p-6">
                <SceneText scene="counterfactual" data={data} />
              </div>
            </section>

            {/* Scene 5: The Context */}
            <section
              className="scene-waypoint min-h-screen flex items-center px-6 sm:px-12"
              data-scene="context"
            >
              <div className="max-w-xl bg-zinc-950/90 backdrop-blur-sm rounded-lg p-6 space-y-6">
                <SceneText scene="context" data={data} />
                {data.airline_context.flights_analyzed >= 30 && (
                  <LeaderboardChart data={data} />
                )}
              </div>
            </section>

            {/* Footnotes at the end */}
            <section className="min-h-[50vh] px-6 sm:px-12 py-20 bg-zinc-950">
              <div className="max-w-2xl">
                <FootnotesSection />
              </div>
            </section>
          </div>
        </div>
      </FootnoteProvider>
    </ErrorBoundary>
  );
}
