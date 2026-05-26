"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { CockpitMapShell } from "./CockpitMapShell";
import { FuelPanel } from "@/components/fuel/FuelPanel";
import { FuelWarnings } from "@/components/fuel/FuelWarnings";
import { StopRecommendation } from "@/components/fuel/StopRecommendation";
import { TripSegments } from "@/components/fuel/TripSegments";
import { LiveTripTracker } from "@/components/location/LiveTripTracker";
import { useTripLocationTracking } from "@/hooks/useTripLocationTracking";
import { formatDurationLabel } from "@/services/location/sessionEngine";
import { OperationalDashboard } from "@/components/operations/OperationalDashboard";
import { EnvironmentalDashboard } from "@/components/weather/EnvironmentalDashboard";
import { RouteMap } from "@/components/map/RouteMap";
import { DriverCopilotBanner } from "@/components/trip/DriverCopilotBanner";
import { FamilySafetyPanel } from "@/components/safety/FamilySafetyPanel";
import { useSafetyRelay } from "@/components/safety/useSafetyRelay";
import {
  getSafetyPreferences,
  subscribeSafetyStorage,
} from "@/services/safety/contactManager";
import { GPS_LOST_MS, loadRelayState } from "@/services/safety/safetyEngine";
import { defaultSafetyPreferences, type TripBroadcastContext } from "@/services/safety/types";
import { DEFAULT_AVERAGE_SPEED_MPH } from "@/services/fuel/fuelMath";
import { buildFuelIntelligence } from "@/services/fuel/fuelService";
import { buildOperationalState } from "@/services/operations/tripStateEngine";
import type { LocationSample } from "@/services/location/types";
import type { LngLat, RouteData } from "@/services/maps/types";
import { getVehicleProfile } from "@/services/vehicle/vehicleStorage";
import { resolvePlanningFillGallons } from "@/services/vehicle/planningFuel";
import { buildLiveTripIntelligence } from "@/services/vehicle/vehicleIntelligence";
import type { TripInput, TripResult } from "@/services/trip/types";
import type { WeatherIntelligence } from "@/services/weather/types";

type OperationalCockpitProps = {
  trip: {
    input: TripInput;
    result: TripResult;
    route: RouteData;
  };
  completedDistanceMiles: number;
  trackerMode: "live" | "manual";
  showLiveData: boolean;
  tripRestored: boolean;
  mapYouPosition: LngLat | null;
  onAutoProgress: (miles: number) => void;
  onModeChange: (mode: "live" | "manual") => void;
  onLocationSample: (sample: LocationSample) => void;
  onProgressChange: (miles: number) => void;
  onStartNewTrip: () => void;
  onOpenPlanner: () => void;
};

export function OperationalCockpit({
  trip,
  completedDistanceMiles,
  trackerMode,
  showLiveData,
  tripRestored,
  mapYouPosition,
  onAutoProgress,
  onModeChange,
  onLocationSample,
  onProgressChange,
  onStartNewTrip,
  onOpenPlanner,
}: OperationalCockpitProps) {
  const [weather, setWeather] = useState<WeatherIntelligence | null>(null);
  const vehicleProfile = useMemo(() => getVehicleProfile(), []);

  const locationTracking = useTripLocationTracking({
    totalDistanceMiles: trip.route.distanceMiles,
    liveDataEnabled: showLiveData,
    initialProgressMiles: completedDistanceMiles,
    onAutoProgress,
    onModeChange,
    onLocationSample,
  });
  const { tracking, gpsSampleAgeMs } = locationTracking;

  const liveDriveSpeedMph =
    showLiveData && trackerMode === "live" && tracking.speedMph > 3
      ? tracking.speedMph
      : undefined;
  const liveIdleMinutes =
    showLiveData && trackerMode === "live"
      ? Math.round(tracking.idleMinutes)
      : undefined;
  const planningFillGallons = resolvePlanningFillGallons(vehicleProfile);

  const { fuelIntelligence, operational, vehicleIntelligence } = useMemo(() => {
    const baseFuel = buildFuelIntelligence({
      totalDistanceMiles: trip.route.distanceMiles,
      vehicleMpg: trip.input.vehicleMpg,
      userGasPrice: trip.input.gasPrice,
      totalFuelCost: trip.result.fuelCost,
      totalGallonsRequired: trip.result.gallonsNeeded,
    });
    const baseOps = buildOperationalState({
      totalDistanceMiles: trip.route.distanceMiles,
      routeEtaLabel: trip.route.etaLabel,
      completedDistanceMiles,
      fuelIntelligence: baseFuel,
    });
    const intelligence = buildLiveTripIntelligence({
      profile: vehicleProfile,
      plannerMpg: trip.input.vehicleMpg,
      totalDistanceMiles: trip.route.distanceMiles,
      completedDistanceMiles,
      gasPrice: trip.input.gasPrice,
      operational: baseOps,
      weather,
      averageSpeedMph: liveDriveSpeedMph,
      idleMinutes: liveIdleMinutes,
      startingFuelGallons: planningFillGallons,
    });
    const dynamicFuel = buildFuelIntelligence({
      totalDistanceMiles: trip.route.distanceMiles,
      vehicleMpg: intelligence.live.effectiveMpg,
      userGasPrice: trip.input.gasPrice,
      totalFuelCost: trip.result.fuelCost,
      totalGallonsRequired: trip.result.gallonsNeeded,
      tankCapacityGallons: intelligence.vehicle.tankGallons,
    });
    const dynamicOps = buildOperationalState({
      totalDistanceMiles: trip.route.distanceMiles,
      routeEtaLabel: trip.route.etaLabel,
      completedDistanceMiles,
      fuelIntelligence: dynamicFuel,
    });
    const liveIntelligence = buildLiveTripIntelligence({
      profile: vehicleProfile,
      plannerMpg: trip.input.vehicleMpg,
      totalDistanceMiles: trip.route.distanceMiles,
      completedDistanceMiles,
      gasPrice: trip.input.gasPrice,
      operational: dynamicOps,
      weather,
      averageSpeedMph: liveDriveSpeedMph,
      idleMinutes: liveIdleMinutes,
      startingFuelGallons: planningFillGallons,
    });
    return {
      fuelIntelligence: dynamicFuel,
      operational: dynamicOps,
      vehicleIntelligence: liveIntelligence,
    };
  }, [
    trip,
    completedDistanceMiles,
    vehicleProfile,
    weather,
    liveDriveSpeedMph,
    liveIdleMinutes,
    planningFillGallons,
  ]);

  useEffect(() => {
    if (!showLiveData) {
      return;
    }
    let cancelled = false;
    async function loadWeather() {
      try {
        const response = await fetch("/api/weather", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startZip: trip.input.startZip,
            destinationZip: trip.input.destinationZip,
            totalDistanceMiles: trip.route.distanceMiles,
            completedDistanceMiles,
            fatigueStatus: operational.fatigue.status,
            drivingSessionHours: operational.progress.drivingSessionHours,
          }),
        });
        const payload = (await response.json()) as WeatherIntelligence | { error?: string };
        if (!response.ok) {
          return;
        }
        if (!cancelled) {
          setWeather(payload as WeatherIntelligence);
        }
      } catch {
        if (!cancelled) {
          setWeather(null);
        }
      }
    }
    void loadWeather();
    return () => {
      cancelled = true;
    };
  }, [
    showLiveData,
    trip.input.startZip,
    trip.input.destinationZip,
    trip.route.distanceMiles,
    completedDistanceMiles,
    operational.fatigue.status,
    operational.progress.drivingSessionHours,
  ]);

  const tripId = `${trip.input.startZip}-${trip.input.destinationZip}`;
  const stopCount = fuelIntelligence.plannedStops.filter(
    (stop) => stop.mileMarker <= completedDistanceMiles,
  ).length;
  const preferences = useSyncExternalStore(
    subscribeSafetyStorage,
    getSafetyPreferences,
    () => defaultSafetyPreferences,
  );
  const relayState = loadRelayState(tripId);

  const broadcastContext: TripBroadcastContext = useMemo(() => {
    const progressPercent =
      trip.route.distanceMiles > 0
        ? Math.round((completedDistanceMiles / trip.route.distanceMiles) * 100)
        : 0;
    const overnightEvent = operational.timeline.find(
      (event) => event.type === "sleep" && event.mileMarker <= completedDistanceMiles,
    );
    return {
      driverName: preferences.driverDisplayName,
      startPlace: trip.input.startPlace,
      destinationPlace: trip.input.destinationPlace,
      currentPlaceLabel: `${progressPercent}% along route`,
      totalDistanceMiles: trip.route.distanceMiles,
      completedDistanceMiles,
      etaLabel: trip.route.etaLabel,
      fuelRangeMiles: vehicleIntelligence.live.remainingRangeMiles,
      weatherRisk: weather?.risk.level ?? "NORMAL",
      weatherSummary: weather?.current.summary ?? "Scattered clouds",
      fatigueStatus: operational.fatigue.status,
      operationalStatus: operational.status,
      nextStopName: fuelIntelligence.recommendedNextStop?.station.name ?? null,
      isOvernightStop: Boolean(overnightEvent),
      gpsStale:
        showLiveData &&
        trackerMode === "live" &&
        gpsSampleAgeMs !== null &&
        gpsSampleAgeMs > GPS_LOST_MS,
      tripStalled: false,
    };
  }, [
    trip,
    completedDistanceMiles,
    vehicleIntelligence,
    weather,
    operational,
    fuelIntelligence,
    preferences.driverDisplayName,
    showLiveData,
    trackerMode,
    gpsSampleAgeMs,
  ]);

  const { emergency } = useSafetyRelay({
    tripId,
    context: broadcastContext,
    stopCount,
    enabled: preferences.relayEnabled,
    gpsSampleAgeMs: showLiveData && trackerMode === "live" ? gpsSampleAgeMs : null,
  });

  const nextStop = fuelIntelligence.recommendedNextStop;
  const isLiveTracking = showLiveData && trackerMode === "live";
  const speedMph = isLiveTracking
    ? tracking.speedMph > 0
      ? tracking.speedMph
      : tracking.movementState === "driving"
        ? DEFAULT_AVERAGE_SPEED_MPH
        : 0
    : DEFAULT_AVERAGE_SPEED_MPH;

  const driveTimeLabel = isLiveTracking
    ? formatDurationLabel(tracking.session.activeDrivingMs)
    : operational.progress.drivingSessionDurationLabel;

  const gpsStatusLabel = !showLiveData
    ? "Static"
    : trackerMode !== "live"
      ? "Manual"
      : tracking.permission !== "granted"
        ? "GPS off"
        : gpsSampleAgeMs !== null && gpsSampleAgeMs < 30_000
          ? "GPS live"
          : tracking.gpsHealth === "stale"
            ? "GPS weak"
            : "Acquiring…";

  const shellData = {
    destination: trip.input.destinationPlace,
    completedMiles: completedDistanceMiles,
    totalMiles: trip.route.distanceMiles,
    etaLabel: trip.route.etaLabel,
    remainingMiles: operational.progress.remainingDistanceMiles,
    efficiencyScore: vehicleIntelligence.live.efficiencyScore,
    liveMpg: vehicleIntelligence.live.effectiveMpg,
    fuelRangeMiles: vehicleIntelligence.live.remainingRangeMiles,
    liveActive: isLiveTracking,
    speedMph,
    driveTimeLabel,
    gpsStatusLabel,
    temperatureF: weather?.current.temperatureF ?? 78,
    weatherSummary: weather?.current.summary ?? "Loading conditions…",
    weatherRisk: weather?.risk.level ?? "NORMAL",
    operationalStatus: operational.status,
    fatigueStatus: operational.fatigue.status,
    alertCount: operational.alerts.length,
    nextStopName: nextStop?.station.name ?? null,
    nextStopCity: nextStop?.station.city ?? "",
    nextStopMiles: nextStop?.stopDistanceMiles ?? 0,
    nextStopEta: nextStop?.estimatedTimingLabel ?? "—",
    gasPrice: trip.input.gasPrice,
    relayEnabled: preferences.relayEnabled,
    familySentAtMs: relayState.lastBroadcast?.sentAtMs ?? null,
    safetyRelayOn: preferences.relayEnabled,
  };

  return (
    <CockpitMapShell
      data={shellData}
      tripRestored={tripRestored}
      showLiveData={showLiveData}
      onStartNewTrip={onStartNewTrip}
      onOpenPlanner={onOpenPlanner}
      map={
        <RouteMap
          variant="cockpit"
          route={trip.route}
          completedDistanceMiles={completedDistanceMiles}
          youPosition={mapYouPosition}
          followTrip
        />
      }
      missionPanel={
        <div className="space-y-3">
          <DriverCopilotBanner
            startPlace={trip.input.startPlace}
            destinationPlace={trip.input.destinationPlace}
            completedDistanceMiles={completedDistanceMiles}
            totalDistanceMiles={trip.route.distanceMiles}
            liveDataEnabled={showLiveData}
            tripRestored={tripRestored}
          />
          <div data-testid="vehicle-intelligence-panel" className="rounded-xl border border-white/10 bg-black/40 p-3">
            <p className="text-sm font-semibold text-white">Vehicle intelligence</p>
            <p data-testid="live-effective-mpg" className="mt-1 text-cyan-300">
              {vehicleIntelligence.live.effectiveMpg} MPG effective
            </p>
            <p data-testid="live-efficiency-score" className="text-sm text-zinc-400">
              Score {vehicleIntelligence.live.efficiencyScore}
            </p>
          </div>
          {emergency.active ? (
            <p data-testid="safety-emergency-warning" className="rounded-xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              {emergency.message}
            </p>
          ) : null}
        </div>
      }
      fuelPanel={
        <div className="space-y-3">
          <FuelPanel intelligence={fuelIntelligence} />
          <FuelWarnings intelligence={fuelIntelligence} />
          <StopRecommendation intelligence={fuelIntelligence} />
          <TripSegments intelligence={fuelIntelligence} />
        </div>
      }
      opsPanel={
        <div className="space-y-3">
          <OperationalDashboard
            route={trip.route}
            fuelIntelligence={fuelIntelligence}
            completedDistanceMiles={completedDistanceMiles}
            onProgressChange={onProgressChange}
            manualProgressEnabled={trackerMode === "manual" || !showLiveData}
          />
          <EnvironmentalDashboard
            tripInput={trip.input}
            route={trip.route}
            fuelIntelligence={fuelIntelligence}
            completedDistanceMiles={completedDistanceMiles}
            liveUpdatesEnabled={showLiveData}
          />
        </div>
      }
      gpsPanel={
        <LiveTripTracker
          totalDistanceMiles={trip.route.distanceMiles}
          startPlace={trip.input.startPlace}
          destinationPlace={trip.input.destinationPlace}
          liveDataEnabled={showLiveData}
          location={locationTracking}
        />
      }
      safetyPanel={<FamilySafetyPanel tripId={tripId} broadcastContext={broadcastContext} />}
    />
  );
}
