"use client";

import { buildOperationalState } from "@/services/operations/tripStateEngine";
import type { FuelIntelligence } from "@/services/fuel/types";
import type { RouteData } from "@/services/maps/types";
import { DriverStatus } from "./DriverStatus";
import { OperationalAlerts } from "./OperationalAlerts";
import { TripProgress } from "./TripProgress";
import { TripTimeline } from "./TripTimeline";
import { statusStyles } from "./statusStyles";

type OperationalDashboardProps = {
  route: RouteData;
  fuelIntelligence: FuelIntelligence;
  completedDistanceMiles: number;
  onProgressChange: (completedMiles: number) => void;
  manualProgressEnabled: boolean;
};

export function OperationalDashboard({
  route,
  fuelIntelligence,
  completedDistanceMiles,
  onProgressChange,
  manualProgressEnabled,
}: OperationalDashboardProps) {
  const state = buildOperationalState({
    totalDistanceMiles: route.distanceMiles,
    routeEtaLabel: route.etaLabel,
    completedDistanceMiles,
    fuelIntelligence,
  });

  const overallStyles = statusStyles[state.status];

  return (
    <section
      data-testid="operational-dashboard"
      className={`rounded-2xl border-2 bg-white p-6 shadow-sm ${overallStyles.border}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-bold text-zinc-900">Operational Co-Pilot</h2>
        <span
          data-testid="operational-status"
          className={`rounded-full border-2 px-4 py-2 text-lg font-bold ${overallStyles.badge}`}
        >
          {state.status.replace("_", " ")}
        </span>
      </div>
      <p className="mt-2 text-lg text-zinc-700">Live trip status · glanceable while driving</p>

      <div className="mt-6 flex flex-col gap-6">
        <TripProgress
          state={state}
          onProgressChange={onProgressChange}
          manualEnabled={manualProgressEnabled}
        />
        <DriverStatus state={state} />
        <OperationalAlerts state={state} />
        <TripTimeline state={state} />
      </div>
    </section>
  );
}
