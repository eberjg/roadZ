"use client";

import { ui } from "@/components/ui/theme";
import type { useTripLocationTracking } from "@/hooks/useTripLocationTracking";
import { DrivingSession } from "./DrivingSession";
import { GPSStatus } from "./GPSStatus";
import { MovementStatus } from "./MovementStatus";

export type TripLocationTracking = ReturnType<typeof useTripLocationTracking>;

type LiveTripTrackerProps = {
  totalDistanceMiles: number;
  startPlace?: string;
  destinationPlace?: string;
  liveDataEnabled?: boolean;
  location: TripLocationTracking;
};

export function LiveTripTracker({
  totalDistanceMiles,
  startPlace,
  destinationPlace,
  liveDataEnabled = true,
  location,
}: LiveTripTrackerProps) {
  const { tracking, enableGps, useManual, useLive } = location;

  const progressPercent =
    totalDistanceMiles > 0
      ? Math.min(100, Math.round((tracking.progressMiles / totalDistanceMiles) * 100))
      : 0;

  return (
    <section data-testid="live-trip-tracker" className={ui.panel}>
      <h2 className={ui.h2}>Live Trip Tracker</h2>
      {startPlace && destinationPlace ? (
        <div
          className="mt-3 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3"
          data-testid="tracker-active-trip"
        >
          <p className={ui.value} data-testid="tracker-trip-route">
            {startPlace} → {destinationPlace}
          </p>
          <p className={`mt-1 ${ui.body}`} data-testid="tracker-trip-progress">
            {tracking.progressMiles.toLocaleString()} / {totalDistanceMiles.toLocaleString()} mi ·{" "}
            {progressPercent}% complete
          </p>
        </div>
      ) : null}
      <p className={`mt-3 ${ui.body}`}>
        Mode: <span data-testid="tracker-mode">{tracking.mode}</span>
        {!liveDataEnabled ? (
          <span data-testid="tracker-static-mode"> · static snapshot</span>
        ) : null}
      </p>
      <div className="mt-4 flex flex-col gap-4">
        <GPSStatus
          tracking={tracking}
          onEnableGps={enableGps}
          onUseManual={useManual}
          onUseLive={useLive}
        />
        <MovementStatus tracking={tracking} />
        <DrivingSession tracking={tracking} />
      </div>
    </section>
  );
}
