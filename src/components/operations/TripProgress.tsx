"use client";

import { ui } from "@/components/ui/theme";
import type { OperationalState } from "@/services/operations/types";

type TripProgressProps = {
  state: OperationalState;
  onProgressChange: (completedMiles: number) => void;
  manualEnabled: boolean;
};

export function TripProgress({
  state,
  onProgressChange,
  manualEnabled,
}: TripProgressProps) {
  const { progress } = state;

  return (
    <section data-testid="trip-progress" className={ui.panelNested}>
      <h3 className={ui.h3}>Trip Progress</h3>

      <label className="mt-5 block">
        <span className={ui.label}>
          Completed miles ({progress.completedDistanceMiles.toLocaleString()} /{" "}
          {progress.totalDistanceMiles.toLocaleString()})
        </span>
        {manualEnabled ? (
          <input
            data-testid="trip-progress-slider"
            type="range"
            min={0}
            max={progress.totalDistanceMiles}
            step={10}
            value={progress.completedDistanceMiles}
            onChange={(event) => onProgressChange(Number(event.target.value))}
            className="mt-3 h-4 w-full cursor-pointer accent-sky-400"
          />
        ) : (
          <p data-testid="trip-progress-live-mode" className={`mt-3 ${ui.body} font-semibold`}>
            Live GPS auto-progress enabled
          </p>
        )}
      </label>

      <div data-testid="trip-completion-percent" className={`mt-4 ${ui.valueHero}`}>
        {progress.completionPercent}% complete
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div data-testid="trip-remaining-distance" className={ui.panelInset}>
          <p className={ui.statLabel}>Remaining</p>
          <p className={`mt-2 ${ui.valueLg}`}>
            {progress.remainingDistanceMiles.toLocaleString()} mi
          </p>
        </div>
        <div data-testid="trip-estimated-arrival" className={ui.panelInset}>
          <p className={ui.statLabel}>Est. arrival</p>
          <p className={`mt-2 ${ui.valueLg}`}>{progress.estimatedArrivalLabel}</p>
        </div>
        <div data-testid="trip-session-duration" className={ui.panelInset}>
          <p className={ui.statLabel}>Driving session</p>
          <p className={`mt-2 ${ui.valueLg}`}>{progress.drivingSessionDurationLabel}</p>
        </div>
        <div data-testid="trip-next-stop-eta" className={ui.panelInset}>
          <p className={ui.statLabel}>Next stop ETA</p>
          <p className={`mt-2 ${ui.valueLg}`}>
            {progress.nextStopEtaLabel ?? "At destination"}
          </p>
        </div>
      </div>
    </section>
  );
}
