import { FloatingPanel } from "./FloatingPanel";
import { SmartOverlay } from "./SmartOverlay";
import type { FuelIntelligence } from "@/services/fuel/types";
import type { OperationalState } from "@/services/operations/types";
import type { VehicleIntelligenceSnapshot } from "@/services/vehicle/types";
import type { WeatherIntelligence } from "@/services/weather/types";

type OperationalHUDProps = {
  intelligence: VehicleIntelligenceSnapshot;
  operational: OperationalState;
  fuelIntelligence: FuelIntelligence;
  weather: WeatherIntelligence | null;
  remainingMiles: number;
  etaLabel: string;
};

export function OperationalHUD({
  intelligence,
  operational,
  fuelIntelligence,
  weather,
  remainingMiles,
  etaLabel,
}: OperationalHUDProps) {
  const nextStop = fuelIntelligence.recommendedNextStop?.station.name ?? "No stop planned";
  const fatigueLabel = operational.fatigue.status.replace("_", " ");
  const topAlert = operational.alerts[0];
  const weatherRisk = weather?.risk.level ?? "NORMAL";

  return (
    <div data-testid="operational-hud" className="pointer-events-none absolute inset-0 z-20">
      <SmartOverlay position="top" testId="hud-top">
        <FloatingPanel testId="hud-top-panel" className="flex flex-wrap gap-4 sm:gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">ETA</p>
            <p data-testid="hud-eta" className="text-lg font-bold text-white">
              {etaLabel}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">Remaining</p>
            <p data-testid="hud-remaining-miles" className="text-lg font-bold text-white">
              {remainingMiles.toLocaleString()} mi
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">Efficiency</p>
            <p data-testid="hud-efficiency-score" className="text-lg font-bold text-emerald-300">
              {intelligence.live.efficiencyScore}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">Live MPG</p>
            <p data-testid="hud-live-mpg" className="text-lg font-bold text-sky-300">
              {intelligence.live.effectiveMpg}
            </p>
          </div>
        </FloatingPanel>
      </SmartOverlay>

      <SmartOverlay position="bottom" testId="hud-bottom">
        <FloatingPanel testId="hud-bottom-panel" className="flex flex-wrap gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">Next fuel</p>
            <p data-testid="hud-next-stop" className="text-sm font-semibold text-white">
              {nextStop}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">Range</p>
            <p data-testid="hud-fuel-range" className="text-sm font-semibold text-amber-300">
              ~{intelligence.live.remainingRangeMiles} mi
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">Fatigue</p>
            <p data-testid="hud-fatigue" className="text-sm font-semibold text-white">
              {fatigueLabel}
            </p>
          </div>
        </FloatingPanel>
      </SmartOverlay>

      <SmartOverlay position="left" testId="hud-left">
        <FloatingPanel testId="hud-weather-panel" pulse={weatherRisk !== "NORMAL"}>
          <p className="text-[10px] uppercase tracking-widest text-zinc-400">Weather</p>
          <p data-testid="hud-weather-risk" className="text-sm font-semibold text-white">
            {weather?.current.summary ?? "Loading…"}
          </p>
          <p className="mt-1 text-xs text-zinc-400">Risk {weatherRisk}</p>
        </FloatingPanel>
      </SmartOverlay>

      <SmartOverlay position="right" testId="hud-right">
        <FloatingPanel
          testId="hud-alerts-panel"
          pulse={Boolean(topAlert && topAlert.severity !== "NORMAL")}
        >
          <p className="text-[10px] uppercase tracking-widest text-zinc-400">Alerts</p>
          {topAlert ? (
            <p data-testid="hud-top-alert" className="text-xs font-semibold text-amber-200">
              {topAlert.message}
            </p>
          ) : (
            <p data-testid="hud-top-alert" className="text-xs text-emerald-300">
              All clear
            </p>
          )}
          <p className="mt-1 text-xs text-zinc-500">{operational.status}</p>
        </FloatingPanel>
      </SmartOverlay>
    </div>
  );
}
