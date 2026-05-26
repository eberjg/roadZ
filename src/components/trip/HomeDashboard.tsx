"use client";

import { useMemo, useState } from "react";
import { DashboardCard } from "@/components/DashboardCard";
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
    <div className="min-h-full bg-zinc-100">
      <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8">
        <header>
          <h1
            data-testid="dashboard-title"
            className="text-4xl font-bold tracking-tight text-zinc-900"
          >
            Road Companion
          </h1>
          <p className="mt-2 text-lg text-zinc-700">Your trip at a glance</p>
        </header>

        <TripPlanner
          onCalculated={(input, result, route) => {
            setTrip({ input, result, route });
            setCompletedDistanceMiles(0);
            setTrackerMode("manual");
          }}
        />

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
            <section
              data-testid="live-trip-tracker"
              className="rounded-2xl border-2 border-zinc-300 bg-white p-6"
            >
              <h2 className="text-2xl font-bold text-zinc-900">Live Trip Tracker</h2>
              <p className="mt-2 text-lg text-zinc-700">
                Start a trip to enable GPS tracking and movement detection
              </p>
            </section>
            <section
              data-testid="operational-dashboard"
              className="rounded-2xl border-2 border-zinc-300 bg-white p-6"
            >
              <h2 className="text-2xl font-bold text-zinc-900">Operational Co-Pilot</h2>
              <p className="mt-2 text-lg text-zinc-700">
                Calculate a trip to activate live operational tracking
              </p>
            </section>
            <section
              data-testid="environmental-dashboard"
              className="rounded-2xl border-2 border-zinc-300 bg-white p-6"
            >
              <h2 className="text-2xl font-bold text-zinc-900">Environmental Awareness</h2>
              <p className="mt-2 text-lg text-zinc-700">
                Calculate a trip for weather and road risk intelligence
              </p>
            </section>
            <DashboardCard title="Fuel Intelligence" testId="fuel-card">
              <p className="text-xl font-semibold text-zinc-900">No fuel data yet</p>
              <p className="mt-2 text-lg text-zinc-700">Calculate a trip to see fuel intelligence</p>
            </DashboardCard>
            <DashboardCard title="Stop Recommendation" testId="stop-card">
              <p className="text-xl font-semibold text-zinc-900">No stop recommendation yet</p>
              <p className="mt-2 text-lg text-zinc-700">Calculate a trip for smart stop planning</p>
            </DashboardCard>
          </>
        )}

        <DashboardCard title="Route Summary" testId="route-card">
          {trip ? (
            <>
              <p className="text-xl font-semibold text-zinc-900">
                {trip.input.startZip} → {trip.input.destinationZip}
              </p>
              <p className="mt-2 text-lg text-zinc-700">
                {trip.route.distanceMiles.toLocaleString()} miles · {trip.route.etaLabel}
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-semibold text-zinc-900">No route calculated yet</p>
              <p className="mt-2 text-lg text-zinc-700">Use Trip Planner above</p>
            </>
          )}
        </DashboardCard>
      </main>
    </div>
  );
}
