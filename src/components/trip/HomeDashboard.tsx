"use client";

import { Suspense, useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { DashboardSettings } from "@/components/settings/DashboardSettings";
import { motion } from "@/components/ui/motion";
import { ui } from "@/components/ui/theme";
import { OperationalCockpit } from "@/components/cockpit/OperationalCockpit";
import { FamilySafetyPanel } from "@/components/safety/FamilySafetyPanel";
import { clearRelayState } from "@/services/safety/safetyEngine";
import { TripPlanner } from "@/components/trip/TripPlanner";
import { VehicleProfileWizard } from "@/components/vehicle/VehicleProfileWizard";
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
  const [showVehicleWizard, setShowVehicleWizard] = useState(false);

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

  const handleNewTrip = useCallback(() => {
    clearTripSession();
    clearRelayState();
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

  if (showVehicleWizard) {
    return <VehicleProfileWizard onComplete={() => setShowVehicleWizard(false)} />;
  }

  const tripPlanner = (
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
  );

  if (trip && plannerExpanded) {
    return (
      <div className={ui.page}>
        <main className={`${ui.main} ${motion.pageEnter}`}>{tripPlanner}</main>
      </div>
    );
  }

  if (trip) {
    return (
      <OperationalCockpit
        trip={trip}
        completedDistanceMiles={completedDistanceMiles}
        trackerMode={trackerMode}
        showLiveData={showLiveData}
        tripRestored={tripRestored}
        mapYouPosition={mapYouPosition}
        onAutoProgress={handleAutoProgress}
        onModeChange={setTrackerMode}
        onLocationSample={handleLocationSample}
        onProgressChange={setCompletedDistanceMiles}
        onStartNewTrip={handleNewTrip}
        onOpenPlanner={() => setPlannerExpanded(true)}
      />
    );
  }

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

        {tripPlanner}

        <section className={`${ui.panelMuted} space-y-2`}>
          <p className={ui.bodyMuted}>
            After you calculate a trip, roadZ opens the live map cockpit with fuel, weather,
            GPS, and family safety tools.
          </p>
        </section>

        <details data-testid="family-safety-details" className={ui.panelMuted}>
          <summary className={`cursor-pointer ${ui.h2}`}>Family safety</summary>
          <div className="mt-4">
            <FamilySafetyPanel />
          </div>
        </details>
      </main>
    </div>
  );
}
