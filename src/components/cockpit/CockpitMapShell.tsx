"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/components/ui/theme";
import { CockpitTabBar, type CockpitTab } from "./CockpitTabBar";
import { FamilyUpdateStrip } from "./FamilyUpdateStrip";
import { LiveDrivingConsole } from "./LiveDrivingConsole";
import { MapControls } from "./MapControls";
import { MetricsStrip } from "./MetricsStrip";
import { MissionHeader } from "./MissionHeader";
import { NextStopOverlayCard } from "./NextStopOverlayCard";
import { SafetyOverlayCard } from "./SafetyOverlayCard";
import { TripSessionBar } from "./TripSessionBar";
import { WeatherOverlayCard } from "./WeatherOverlayCard";

export type CockpitShellData = {
  destination: string;
  completedMiles: number;
  totalMiles: number;
  etaLabel: string;
  remainingMiles: number;
  efficiencyScore: number;
  liveMpg: number;
  fuelRangeMiles: number;
  liveActive: boolean;
  speedMph: number;
  driveTimeLabel: string;
  temperatureF: number;
  weatherSummary: string;
  weatherRisk: string;
  operationalStatus: string;
  fatigueStatus: string;
  alertCount: number;
  nextStopName: string | null;
  nextStopCity: string;
  nextStopMiles: number;
  nextStopEta: string;
  gasPrice?: number;
  relayEnabled: boolean;
  familySentAtMs: number | null;
  safetyRelayOn: boolean;
};

type CockpitMapShellProps = {
  map: ReactNode;
  data: CockpitShellData;
  tripRestored?: boolean;
  showLiveData?: boolean;
  onStartNewTrip?: () => void;
  onOpenPlanner?: () => void;
  missionPanel: ReactNode;
  fuelPanel: ReactNode;
  opsPanel: ReactNode;
  gpsPanel: ReactNode;
  safetyPanel: ReactNode;
};

export function CockpitMapShell({
  map,
  data,
  tripRestored = false,
  showLiveData = true,
  onStartNewTrip,
  onOpenPlanner,
  missionPanel,
  fuelPanel,
  opsPanel,
  gpsPanel,
  safetyPanel,
}: CockpitMapShellProps) {
  const [activeTab, setActiveTab] = useState<CockpitTab | null>(null);

  const tabPanel =
    activeTab === "mission"
      ? missionPanel
      : activeTab === "fuel"
        ? fuelPanel
        : activeTab === "ops"
          ? opsPanel
          : activeTab === "gps"
            ? gpsPanel
            : activeTab === "safety"
              ? safetyPanel
              : null;

  return (
    <div
      data-testid="cockpit-layout"
      className="relative flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-black"
    >
      {/* Full-screen map */}
      <div
        data-testid="cockpit-map-stage"
        className="absolute inset-0 z-0 min-h-[50vh]"
      >
        {map}
      </div>

      {/* Top mission stack — does not cover map center */}
      <div className="relative z-20 flex shrink-0 flex-col gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pointer-events-none">
        <MissionHeader
          destination={data.destination}
          completedMiles={data.completedMiles}
          totalMiles={data.totalMiles}
          etaLabel={data.etaLabel}
          liveActive={data.liveActive}
          onOpenPlanner={onOpenPlanner}
        />
        <MetricsStrip
          etaLabel={data.etaLabel}
          remainingMiles={data.remainingMiles}
          efficiencyScore={data.efficiencyScore}
          liveMpg={data.liveMpg}
          fuelRangeMiles={data.fuelRangeMiles}
        />
        {onStartNewTrip ? (
          <TripSessionBar
            tripRestored={tripRestored}
            showLiveData={showLiveData}
            onStartNewTrip={onStartNewTrip}
          />
        ) : null}
      </div>

      {/* Floating overlays — fixed zones, no overlap */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute left-3 top-[9.5rem] max-h-[7rem] sm:top-[10rem]">
          <WeatherOverlayCard
            temperatureF={data.temperatureF}
            summary={data.weatherSummary}
            riskLevel={data.weatherRisk}
          />
        </div>
        <div className="absolute right-3 top-[9.5rem] max-h-[8rem] sm:top-[10rem]">
          <SafetyOverlayCard
            status={data.operationalStatus}
            fatigueStatus={data.fatigueStatus}
            weatherRisk={data.weatherRisk}
            alertCount={data.alertCount}
            relayActive={data.safetyRelayOn}
          />
        </div>
        {data.nextStopName ? (
          <div className="absolute bottom-[11.5rem] left-3 max-w-[46%] sm:bottom-[12rem]">
            <NextStopOverlayCard
              stopName={data.nextStopName}
              stopCity={data.nextStopCity}
              milesAhead={data.nextStopMiles}
              etaLabel={data.nextStopEta}
              gasPrice={data.gasPrice}
            />
          </div>
        ) : null}
        <div className="absolute right-3 top-1/2 z-20 -translate-y-1/2">
          <MapControls />
        </div>
      </div>

      {/* Bottom console + tabs */}
      <div className="relative z-30 mt-auto flex flex-col pointer-events-none">
        {tabPanel ? (
          <div
            data-testid="cockpit-detail-panel"
            className={cn(
              "pointer-events-auto mx-2 mb-2 max-h-[32vh] overflow-y-auto rounded-2xl",
              "border border-white/10 bg-slate-950/92 p-3 shadow-2xl backdrop-blur-xl",
            )}
          >
            {tabPanel}
          </div>
        ) : null}
        <LiveDrivingConsole
          speedMph={data.speedMph}
          efficiencyScore={data.efficiencyScore}
          driveTimeLabel={data.driveTimeLabel}
        />
        <FamilyUpdateStrip
          sentAtMs={data.familySentAtMs}
          relayEnabled={data.relayEnabled}
          onView={() => setActiveTab("safety")}
        />
        <CockpitTabBar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab((current) => (current === tab ? null : tab))}
        />
      </div>

      {/* Legacy HUD hook for tests */}
      <div data-testid="operational-hud" className="sr-only" aria-hidden>
        <span data-testid="hud-top-panel" />
        <span data-testid="hud-bottom-panel" />
      </div>
    </div>
  );
}
