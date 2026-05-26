"use client";

import { Suspense, useMemo, useState } from "react";
import { DashboardCard } from "@/components/DashboardCard";
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
import { TripPlanner } from "@/components/trip/TripPlanner";
import { buildFuelIntelligence } from "@/services/fuel/fuelService";
import type { FuelIntelligence } from "@/services/fuel/types";
import type { RouteData } from "@/services/maps/types";
import type { TripInput, TripResult } from "@/services/trip/types";

type TripState = {
  input: TripInput;
  result: TripResult;
  route: RouteData;
};

export function HomeDashboard() {
  const [trip, setTrip] = useState<TripState | null>(null);
  const [completedDistanceMiles, setCompletedDistanceMiles] = useState(0);
  const [trackerMode, setTrackerMode] = useState<"live" | "manual">("manual");

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

  return (
    <div className={ui.page}>
      <main className={`${ui.main} ${motion.pageEnter}`}>
        <header className={motion.cardEnter}>
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-400/90">
            Road Companion Pilot
          </p>
          <h1 data-testid="dashboard-title" className={`mt-1 ${ui.title}`}>
            Road Companion
          </h1>
          <p className={ui.subtitle}>Your trip at a glance</p>
        </header>

        <Suspense
          fallback={
            <section className={ui.panelMuted}>
              <p className={ui.body}>Loading trip planner…</p>
            </section>
          }
        >
          <TripPlanner
            onCalculated={(input, result, route) => {
              setTrip({ input, result, route });
              setCompletedDistanceMiles(0);
              setTrackerMode("manual");
            }}
          />
        </Suspense>

        {trip && fuelIntelligence ? (
          <>
            <LiveTripTracker
              totalDistanceMiles={trip.route.distanceMiles}
              onAutoProgress={setCompletedDistanceMiles}
              onModeChange={setTrackerMode}
            />
            <OperationalDashboard
              route={trip.route}
              fuelIntelligence={fuelIntelligence}
              completedDistanceMiles={completedDistanceMiles}
              onProgressChange={setCompletedDistanceMiles}
              manualProgressEnabled={trackerMode === "manual"}
            />
            <EnvironmentalDashboard
              tripInput={trip.input}
              route={trip.route}
              fuelIntelligence={fuelIntelligence}
              completedDistanceMiles={completedDistanceMiles}
            />
            <RouteSummary route={trip.route} />
            <RouteMap route={trip.route} />
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
