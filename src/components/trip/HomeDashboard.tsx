"use client";

import { Suspense, useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { DashboardCard } from "@/components/DashboardCard";
import { DashboardSettings } from "@/components/settings/DashboardSettings";
import { motion } from "@/components/ui/motion";
import { ui } from "@/components/ui/theme";
import { FuelPanel } from "@/components/fuel/FuelPanel";
import { FuelWarnings } from "@/components/fuel/FuelWarnings";
import { StopRecommendation } from "@/components/fuel/StopRecommendation";
import { TripSegments } from "@/components/fuel/TripSegments";
import { LiveTripTracker } from "@/components/location/LiveTripTracker";
import { OperationalDashboard } from "@/components/operations/OperationalDashboard";
import { EnvironmentalDashboard } from "@/components/weather/EnvironmentalDashboard";
import { RouteMap } from "@/components/map/RouteMap";
import { RouteSummary } from "@/components/map/RouteSummary";
import { DriverCopilotBanner } from "@/components/trip/DriverCopilotBanner";
import { TripPlanner } from "@/components/trip/TripPlanner";
import {
  defaultDashboardPreferences,
  getDashboardPreferences,
  getStoredPermissionState,
  subscribeAppStorage,
} from "@/services/preferences/appStorage";
import {
  clearTripSession,
  loadTripSession,
  saveTripSession,
  subscribeTripSession,
} from "@/services/preferences/tripSessionStorage";
import { buildFuelIntelligence } from "@/services/fuel/fuelService";
import type { FuelIntelligence } from "@/services/fuel/types";
import type { LocationSample } from "@/services/location/types";
import { resolveYouAreHere } from "@/services/maps/routeProgress";
import type { LngLat, RouteData } from "@/services/maps/types";
import type { TripInput, TripResult } from "@/services/trip/types";

type TripState = {
  input: TripInput;
  result: TripResult;
  route: RouteData;
};

function sessionToTripState(saved: NonNullable<ReturnType<typeof loadTripSession>>): TripState {
  return {
    input: saved.input,
    result: saved.result,
    route: saved.route,
  };
}

export function HomeDashboard() {
  const savedSession = useSyncExternalStore(
    subscribeTripSession,
    loadTripSession,
    () => null,
  );

  const [tripOverride, setTripOverride] = useState<TripState | null | undefined>(undefined);
  const [progressOverride, setProgressOverride] = useState<number | undefined>(undefined);
  const [modeOverride, setModeOverride] = useState<"live" | "manual" | undefined>(undefined);
  const [livePositionOverride, setLivePositionOverride] = useState<LngLat | null | undefined>(
    undefined,
  );
  const [sessionCleared, setSessionCleared] = useState(false);
  const [plannerExpanded, setPlannerExpanded] = useState(false);

  const restoredTrip = useMemo(
    () => (savedSession ? sessionToTripState(savedSession) : null),
    [savedSession],
  );

  const trip = sessionCleared
    ? tripOverride ?? null
    : tripOverride !== undefined
      ? tripOverride
      : restoredTrip;

  const completedDistanceMiles =
    progressOverride ?? savedSession?.completedDistanceMiles ?? 0;
  const trackerMode = modeOverride ?? savedSession?.trackerMode ?? "manual";
  const livePosition =
    livePositionOverride !== undefined
      ? livePositionOverride
      : savedSession?.lastKnownPosition ?? null;
  const tripRestored = Boolean(savedSession && tripOverride === undefined && !sessionCleared);

  const setCompletedDistanceMiles = useCallback((miles: number) => {
    setProgressOverride(miles);
  }, []);

  const setTrackerMode = useCallback((mode: "live" | "manual") => {
    setModeOverride(mode);
  }, []);

  const preferences = useSyncExternalStore(
    subscribeAppStorage,
    () => getDashboardPreferences(),
    () => defaultDashboardPreferences,
  );

  const showLiveData = preferences.showLiveData;
  const useLiveMapPosition = showLiveData && trackerMode === "live" && Boolean(livePosition);
  const usePersistedMapSnapshot =
    tripRestored && progressOverride === undefined && Boolean(livePosition);

  const mapYouPosition = useMemo(() => {
    if (!trip) {
      return null;
    }
    return resolveYouAreHere({
      polyline: trip.route.polyline,
      completedDistanceMiles,
      livePosition: useLiveMapPosition ? livePosition : null,
      persistedPosition: livePosition,
      preferLivePosition: useLiveMapPosition,
      usePersistedSnapshot: usePersistedMapSnapshot,
    });
  }, [
    trip,
    completedDistanceMiles,
    livePosition,
    useLiveMapPosition,
    usePersistedMapSnapshot,
  ]);

  useEffect(() => {
    if (!trip) {
      return;
    }
    saveTripSession({
      input: trip.input,
      result: trip.result,
      route: trip.route,
      completedDistanceMiles,
      trackerMode,
      lastKnownPosition: mapYouPosition,
    });
  }, [trip, completedDistanceMiles, trackerMode, mapYouPosition]);

  const fuelIntelligence: FuelIntelligence | null = useMemo(() => {
    if (!trip) {
      return null;
    }
    return buildFuelIntelligence({
      totalDistanceMiles: trip.route.distanceMiles,
      vehicleMpg: trip.input.vehicleMpg,
      userGasPrice: trip.input.gasPrice,
      totalFuelCost: trip.result.fuelCost,
      totalGallonsRequired: trip.result.gallonsNeeded,
    });
  }, [trip]);

  const handleNewTrip = useCallback(() => {
    clearTripSession();
    setSessionCleared(true);
    setTripOverride(null);
    setProgressOverride(undefined);
    setModeOverride(undefined);
    setLivePositionOverride(undefined);
    setPlannerExpanded(true);
  }, []);

  const persistTrip = useCallback(
    (
      nextTrip: TripState,
      progressMiles: number,
      mode: "live" | "manual",
      position: LngLat | null = null,
    ) => {
      saveTripSession({
        input: nextTrip.input,
        result: nextTrip.result,
        route: nextTrip.route,
        completedDistanceMiles: progressMiles,
        trackerMode: mode,
        lastKnownPosition: position,
      });
    },
    [],
  );

  const handleLocationSample = useCallback(
    (sample: LocationSample) => {
      if (!showLiveData) {
        return;
      }
      setLivePositionOverride({
        lng: sample.longitude,
        lat: sample.latitude,
      });
    },
    [showLiveData],
  );

  const handleAutoProgress = useCallback(
    (miles: number) => {
      if (showLiveData) {
        setProgressOverride(miles);
      }
    },
    [showLiveData],
  );

  return (
    <div className={ui.page}>
      <main className={`${ui.main} ${motion.pageEnter}`}>
        <header className={motion.cardEnter}>
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-400/90">
            roadZ pilot
          </p>
          <h1 data-testid="dashboard-title" className={`mt-1 ${ui.title}`}>
            roadZ
          </h1>
          <p className={ui.subtitle}>Your trip at a glance</p>
        </header>

        <DashboardSettings
          hasActiveTrip={Boolean(trip)}
          tripRestored={tripRestored}
          onStartNewTrip={handleNewTrip}
        />

        <Suspense
          fallback={
            <section className={ui.panelMuted}>
              <p className={ui.body}>Loading trip planner…</p>
            </section>
          }
        >
          <TripPlanner
            key={trip ? "active" : "empty"}
            initialTrip={trip?.input ?? null}
            initialResult={trip?.result ?? null}
            isCollapsed={Boolean(trip) && !plannerExpanded}
            activeTripSummary={
              trip
                ? {
                    startPlace: trip.input.startPlace,
                    destinationPlace: trip.input.destinationPlace,
                    distanceMiles: trip.route.distanceMiles,
                  }
                : null
            }
            onRequestExpand={() => setPlannerExpanded(true)}
            onRequestCollapse={() => setPlannerExpanded(false)}
            onCalculated={(input, result, route) => {
              const nextTrip = { input, result, route };
              const permission = getStoredPermissionState();
              const startLive = showLiveData && permission === "granted";
              setSessionCleared(false);
              setTripOverride(nextTrip);
              setProgressOverride(0);
              setModeOverride(startLive ? "live" : "manual");
              setPlannerExpanded(false);
              persistTrip(nextTrip, 0, startLive ? "live" : "manual");
            }}
          />
        </Suspense>

        {trip && !plannerExpanded ? (
          <DriverCopilotBanner
            startPlace={trip.input.startPlace}
            destinationPlace={trip.input.destinationPlace}
            completedDistanceMiles={completedDistanceMiles}
            totalDistanceMiles={trip.route.distanceMiles}
            liveDataEnabled={showLiveData}
            tripRestored={tripRestored}
          />
        ) : null}

        {!showLiveData && trip ? (
          <p
            data-testid="static-mode-banner"
            className={`rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 ${ui.body}`}
          >
            Static mode — trip totals stay fixed. Turn on{" "}
            <strong className="text-white">Live dynamic data</strong> for GPS and weather updates.
          </p>
        ) : null}

        {trip && fuelIntelligence ? (
          <>
            <LiveTripTracker
              totalDistanceMiles={trip.route.distanceMiles}
              startPlace={trip.input.startPlace}
              destinationPlace={trip.input.destinationPlace}
              liveDataEnabled={showLiveData}
              initialProgressMiles={completedDistanceMiles}
              onAutoProgress={handleAutoProgress}
              onModeChange={setTrackerMode}
              onLocationSample={handleLocationSample}
            />
            <RouteMap
              route={trip.route}
              completedDistanceMiles={completedDistanceMiles}
              youPosition={mapYouPosition}
              followTrip
            />
            <OperationalDashboard
              route={trip.route}
              fuelIntelligence={fuelIntelligence}
              completedDistanceMiles={completedDistanceMiles}
              onProgressChange={setCompletedDistanceMiles}
              manualProgressEnabled={trackerMode === "manual" || !showLiveData}
            />
            <EnvironmentalDashboard
              tripInput={trip.input}
              route={trip.route}
              fuelIntelligence={fuelIntelligence}
              completedDistanceMiles={completedDistanceMiles}
              liveUpdatesEnabled={showLiveData}
            />
            <RouteSummary route={trip.route} />
            <FuelPanel intelligence={fuelIntelligence} />
            <FuelWarnings intelligence={fuelIntelligence} />
            <StopRecommendation intelligence={fuelIntelligence} />
            <TripSegments intelligence={fuelIntelligence} />
          </>
        ) : (
          <>
            <section data-testid="live-trip-tracker" className={ui.panelMuted}>
              <h2 className={ui.h2}>Live Trip Tracker</h2>
              <p className={`mt-2 ${ui.body}`}>
                Start a trip to enable GPS tracking and movement detection
              </p>
            </section>
            <section data-testid="operational-dashboard" className={ui.panelMuted}>
              <h2 className={ui.h2}>Operational Co-Pilot</h2>
              <p className={`mt-2 ${ui.body}`}>
                Calculate a trip to activate live operational tracking
              </p>
            </section>
            <section data-testid="environmental-dashboard" className={ui.panelMuted}>
              <h2 className={ui.h2}>Environmental Awareness</h2>
              <p className={`mt-2 ${ui.body}`}>
                Calculate a trip for weather and road risk intelligence
              </p>
            </section>
            <DashboardCard title="Fuel Intelligence" testId="fuel-card">
              <p className={ui.value}>No fuel data yet</p>
              <p className={`mt-2 ${ui.body}`}>Calculate a trip to see fuel intelligence</p>
            </DashboardCard>
            <DashboardCard title="Stop Recommendation" testId="stop-card">
              <p className={ui.value}>No stop recommendation yet</p>
              <p className={`mt-2 ${ui.body}`}>Calculate a trip for smart stop planning</p>
            </DashboardCard>
          </>
        )}

        <DashboardCard title="Route Summary" testId="route-card">
          {trip ? (
            <>
              <p className={ui.value}>
                {trip.input.startPlace} → {trip.input.destinationPlace}
              </p>
              <p className={`mt-2 ${ui.body}`}>
                {trip.route.distanceMiles.toLocaleString()} miles · {trip.route.etaLabel}
              </p>
            </>
          ) : (
            <>
              <p className={ui.value}>No route calculated yet</p>
              <p className={`mt-2 ${ui.body}`}>Use Trip Planner above</p>
            </>
          )}
        </DashboardCard>
      </main>
    </div>
  );
}
