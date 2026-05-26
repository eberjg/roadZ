"use client";

import { useEffect, useMemo, useState } from "react";
import { buildOperationalState } from "@/services/operations/tripStateEngine";
import type { FuelIntelligence } from "@/services/fuel/types";
import type { RouteData } from "@/services/maps/types";
import type { TripInput } from "@/services/trip/types";
import type { WeatherIntelligence } from "@/services/weather/types";
import { ui } from "@/components/ui/theme";
import { EnvironmentalSummary } from "./EnvironmentalSummary";
import { RiskPanel } from "./RiskPanel";
import { SevereAlerts } from "./SevereAlerts";
import { WeatherPanel } from "./WeatherPanel";
import { WeatherTimeline } from "./WeatherTimeline";

type EnvironmentalDashboardProps = {
  tripInput: TripInput;
  route: RouteData;
  fuelIntelligence: FuelIntelligence;
  completedDistanceMiles: number;
  liveUpdatesEnabled?: boolean;
};

export function EnvironmentalDashboard({
  tripInput,
  route,
  fuelIntelligence,
  completedDistanceMiles,
  liveUpdatesEnabled = true,
}: EnvironmentalDashboardProps) {
  const [weather, setWeather] = useState<WeatherIntelligence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshotMiles] = useState(completedDistanceMiles);

  const milesForAnalysis = liveUpdatesEnabled ? completedDistanceMiles : snapshotMiles;

  const operational = useMemo(
    () =>
      buildOperationalState({
        totalDistanceMiles: route.distanceMiles,
        routeEtaLabel: route.etaLabel,
        completedDistanceMiles: milesForAnalysis,
        fuelIntelligence,
      }),
    [route, milesForAnalysis, fuelIntelligence],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/weather", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startZip: tripInput.startZip,
            destinationZip: tripInput.destinationZip,
            totalDistanceMiles: route.distanceMiles,
            completedDistanceMiles: milesForAnalysis,
            fatigueStatus: operational.fatigue.status,
            drivingSessionHours: operational.progress.drivingSessionHours,
          }),
        });
        const payload = (await response.json()) as WeatherIntelligence | { error?: string };
        if (!response.ok) {
          throw new Error("error" in payload ? payload.error : "Weather unavailable");
        }
        if (!cancelled) {
          setWeather(payload as WeatherIntelligence);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "Weather unavailable");
          setWeather(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadWeather();

    return () => {
      cancelled = true;
    };
  }, [
    liveUpdatesEnabled,
    tripInput.startZip,
    tripInput.destinationZip,
    route.distanceMiles,
    milesForAnalysis,
    operational.fatigue.status,
    operational.progress.drivingSessionHours,
  ]);

  if (loading) {
    return (
      <section data-testid="environmental-dashboard" className={ui.panelMuted}>
        <p data-testid="weather-loading" className={`${ui.body} font-semibold text-zinc-300`}>
          Loading weather intelligence…
        </p>
      </section>
    );
  }

  if (error || !weather) {
    return (
      <section data-testid="environmental-dashboard" className={ui.errorBox}>
        <p data-testid="weather-error" className={ui.errorText}>
          {error ?? "Weather data unavailable"}
        </p>
      </section>
    );
  }

  return (
    <div data-testid="environmental-dashboard" className="flex flex-col gap-6">
      <EnvironmentalSummary intelligence={weather} />
      <WeatherPanel intelligence={weather} />
      <RiskPanel intelligence={weather} />
      <SevereAlerts intelligence={weather} />
      <WeatherTimeline intelligence={weather} />
    </div>
  );
}
