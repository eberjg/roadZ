"use client";

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
    <section
      data-testid="trip-progress"
      className="rounded-2xl border-2 border-zinc-900 bg-white p-6 shadow-sm"
    >
      <h3 className="text-2xl font-bold text-zinc-900">Trip Progress</h3>

      <label className="mt-5 block">
        <span className="text-lg font-semibold text-zinc-800">
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
            className="mt-3 h-4 w-full cursor-pointer accent-zinc-900"
          />
        ) : (
          <p data-testid="trip-progress-live-mode" className="mt-3 text-lg font-semibold text-zinc-700">
            Live GPS auto-progress enabled
          </p>
        )}
      </label>

      <div
        data-testid="trip-completion-percent"
        className="mt-4 text-4xl font-bold text-zinc-900"
      >
        {progress.completionPercent}% complete
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div
          data-testid="trip-remaining-distance"
          className="rounded-xl border-2 border-zinc-900 bg-zinc-50 p-4"
        >
          <p className="text-sm font-semibold uppercase text-zinc-600">Remaining</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">
            {progress.remainingDistanceMiles.toLocaleString()} mi
          </p>
        </div>
        <div
          data-testid="trip-estimated-arrival"
          className="rounded-xl border-2 border-zinc-900 bg-zinc-50 p-4"
        >
          <p className="text-sm font-semibold uppercase text-zinc-600">Est. arrival</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">
            {progress.estimatedArrivalLabel}
          </p>
        </div>
        <div
          data-testid="trip-session-duration"
          className="rounded-xl border-2 border-zinc-900 bg-zinc-50 p-4"
        >
          <p className="text-sm font-semibold uppercase text-zinc-600">Driving session</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">
            {progress.drivingSessionDurationLabel}
          </p>
        </div>
        <div
          data-testid="trip-next-stop-eta"
          className="rounded-xl border-2 border-zinc-900 bg-zinc-50 p-4"
        >
          <p className="text-sm font-semibold uppercase text-zinc-600">Next stop ETA</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">
            {progress.nextStopEtaLabel ?? "At destination"}
          </p>
        </div>
      </div>
    </section>
  );
}
