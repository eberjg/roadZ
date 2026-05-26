"use client";

import { useEffect, useMemo, useState } from "react";
import { CockpitLayout } from "./CockpitLayout";
import { TripStatusStrip } from "./TripStatusStrip";
import { OperationalHUD } from "./OperationalHUD";
import { AdaptiveBottomSheet } from "./AdaptiveBottomSheet";
import { DashboardSettings } from "@/components/settings/DashboardSettings";
import { FuelPanel } from "@/components/fuel/FuelPanel";
import { FuelWarnings } from "@/components/fuel/FuelWarnings";
import { StopRecommendation } from "@/components/fuel/StopRecommendation";
import { TripSegments } from "@/components/fuel/TripSegments";
import { LiveTripTracker } from "@/components/location/LiveTripTracker";
import { OperationalDashboard } from "@/components/operations/OperationalDashboard";
import { EnvironmentalDashboard } from "@/components/weather/EnvironmentalDashboard";
import { RouteMap } from "@/components/map/RouteMap";
import { DriverCopilotBanner } from "@/components/trip/DriverCopilotBanner";
import { buildFuelIntelligence } from "@/services/fuel/fuelService";
import { buildOperationalState } from "@/services/operations/tripStateEngine";
import type { LocationSample } from "@/services/location/types";
import type { LngLat, RouteData } from "@/services/maps/types";
import { getVehicleProfile } from "@/services/vehicle/vehicleStorage";
import { buildLiveTripIntelligence } from "@/services/vehicle/vehicleIntelligence";
import type { TripInput, TripResult } from "@/services/trip/types";
import type { WeatherIntelligence } from "@/services/weather/types";
import { ui } from "@/components/ui/theme";

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
    });
    return {
      fuelIntelligence: dynamicFuel,
      operational: dynamicOps,
      vehicleIntelligence: liveIntelligence,
    };
  }, [trip, completedDistanceMiles, vehicleProfile, weather]);

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

  const remainingMiles = operational.progress.remainingDistanceMiles;
  const liveActive = showLiveData && trackerMode === "live";

  return (
    <CockpitLayout
      tripStrip={
        <TripStatusStrip
          startPlace={trip.input.startPlace}
          destinationPlace={trip.input.destinationPlace}
          completedMiles={completedDistanceMiles}
          totalMiles={trip.route.distanceMiles}
          etaLabel={trip.route.etaLabel}
          liveActive={liveActive}
          onOpenPlanner={onOpenPlanner}
        />
      }
      map={
        <RouteMap
          variant="immersive"
          route={trip.route}
          completedDistanceMiles={completedDistanceMiles}
          youPosition={mapYouPosition}
          followTrip
        />
      }
      hud={
        <OperationalHUD
          intelligence={vehicleIntelligence}
          operational={operational}
          fuelIntelligence={fuelIntelligence}
          weather={weather}
          remainingMiles={remainingMiles}
          etaLabel={trip.route.etaLabel}
        />
      }
      bottomSheet={
        <div className="flex flex-col">
          {!showLiveData ? (
            <p
              data-testid="static-mode-banner"
              className={`mx-3 mb-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm ${ui.body}`}
            >
              Static mode — turn on live data for GPS and weather updates.
            </p>
          ) : null}
          <DashboardSettings
            hasActiveTrip
            tripRestored={tripRestored}
            onStartNewTrip={onStartNewTrip}
            compact
          />
        <AdaptiveBottomSheet
          summaryLine={vehicleIntelligence.summary}
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
              <div data-testid="vehicle-intelligence-panel" className={ui.panelNested}>
                <p className={ui.h3}>Vehicle intelligence</p>
                <p data-testid="live-effective-mpg" className={`mt-2 ${ui.value}`}>
                  {vehicleIntelligence.live.effectiveMpg} MPG effective
                </p>
                <p data-testid="live-efficiency-score" className={ui.body}>
                  Efficiency score {vehicleIntelligence.live.efficiencyScore}
                </p>
                {vehicleIntelligence.live.adjustments.length > 0 ? (
                  <ul
                    data-testid="mpg-adjustments"
                    className={`mt-2 list-disc pl-5 ${ui.bodyMuted}`}
                  >
                    {vehicleIntelligence.live.adjustments.map((item) => (
                      <li key={item.factor}>
                        {item.factor}: {item.impactPercent}%
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
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
              initialProgressMiles={completedDistanceMiles}
              onAutoProgress={onAutoProgress}
              onModeChange={onModeChange}
              onLocationSample={onLocationSample}
            />
          }
        />
        </div>
      }
    />
  );
}
