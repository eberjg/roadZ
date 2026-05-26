"use client";

import { useEffect, useState } from "react";
import {
  getPermissionState,
  requestLocationAccess,
  startLocationWatch,
  supportsGeolocation,
} from "@/services/location/gpsClient";
import { getStoredPermissionState } from "@/services/preferences/appStorage";
import {
  applyLocationUpdate,
  applyPermissionState,
  applyTrackingError,
  buildInitialTrackingState,
} from "@/services/location/tripTracker";
import type { LocationSample, TripTrackingState } from "@/services/location/types";
import { ui } from "@/components/ui/theme";
import { DrivingSession } from "./DrivingSession";
import { GPSStatus } from "./GPSStatus";
import { MovementStatus } from "./MovementStatus";

type LiveTripTrackerProps = {
  totalDistanceMiles: number;
  startPlace?: string;
  destinationPlace?: string;
  liveDataEnabled?: boolean;
  initialProgressMiles?: number;
  onAutoProgress: (miles: number) => void;
  onModeChange: (mode: "live" | "manual") => void;
  onLocationSample?: (sample: LocationSample) => void;
};

export function LiveTripTracker({
  totalDistanceMiles,
  startPlace,
  destinationPlace,
  liveDataEnabled = true,
  initialProgressMiles = 0,
  onAutoProgress,
  onModeChange,
  onLocationSample,
}: LiveTripTrackerProps) {
  const [tracking, setTracking] = useState<TripTrackingState>(() => ({
    ...buildInitialTrackingState(),
    progressMiles: initialProgressMiles,
    mode: liveDataEnabled ? "manual" : "manual",
  }));

  useEffect(() => {
    async function setup() {
      const stored = getStoredPermissionState();
      if (stored === "granted" && liveDataEnabled) {
        setTracking((previous) => ({
          ...applyPermissionState(previous, "granted"),
          mode: "live",
          error: null,
          progressMiles: initialProgressMiles,
        }));
        return;
      }
      if (stored === "granted" && !liveDataEnabled) {
        setTracking((previous) => ({
          ...applyPermissionState(previous, "granted"),
          mode: "manual",
          progressMiles: initialProgressMiles,
        }));
        return;
      }
      if (stored === "denied") {
        setTracking((previous) => applyPermissionState(previous, "denied"));
        return;
      }
      const permission = await getPermissionState();
      setTracking((previous) => applyPermissionState(previous, permission));
    }
    void setup();
  }, [initialProgressMiles, liveDataEnabled]);

  useEffect(() => {
    if (!liveDataEnabled || tracking.mode !== "live" || tracking.permission !== "granted") {
      return;
    }

    const stopWatch = startLocationWatch(
      (sample) => {
        onLocationSample?.(sample);
        setTracking((previous) => {
          const next = applyLocationUpdate({
            previous,
            sample,
            totalDistanceMiles,
          });
          return next;
        });
      },
      (message, code) => {
        setTracking((previous) => {
          const errored = applyTrackingError(previous, message);
          if (code === "denied") {
            return {
              ...errored,
              permission: "denied",
              gpsHealth: "denied",
            };
          }
          return errored;
        });
        onModeChange("manual");
      },
    );

    return () => stopWatch();
  }, [
    liveDataEnabled,
    tracking.mode,
    tracking.permission,
    totalDistanceMiles,
    onAutoProgress,
    onLocationSample,
    onModeChange,
  ]);

  useEffect(() => {
    if (liveDataEnabled) {
      onAutoProgress(tracking.progressMiles);
    }
  }, [liveDataEnabled, tracking.progressMiles, onAutoProgress]);

  useEffect(() => {
    onModeChange(tracking.mode);
  }, [tracking.mode, onModeChange]);

  const enableGps = async () => {
    if (!supportsGeolocation()) {
      setTracking((previous) =>
        applyTrackingError(previous, "Geolocation is not supported on this browser."),
      );
      return;
    }

    setTracking((previous) => ({
      ...previous,
      error: null,
      permission: "prompt",
    }));

    const access = await requestLocationAccess();
    if (!access.ok) {
      setTracking((previous) => {
        const next =
          access.code === "denied"
            ? applyPermissionState(previous, "denied")
            : applyPermissionState(previous, "prompt");
        return applyTrackingError(next, access.message);
      });
      return;
    }

    onLocationSample?.(access.sample);
    setTracking((previous) => {
      const granted = applyPermissionState(previous, "granted");
      const withSample = applyLocationUpdate({
        previous: { ...granted, mode: "live", error: null },
        sample: access.sample,
        totalDistanceMiles,
      });
      return { ...withSample, mode: "live", error: null };
    });
  };

  const useManual = () => {
    setTracking((previous) => ({ ...previous, mode: "manual" }));
  };

  const useLive = () => {
    if (tracking.permission === "granted") {
      setTracking((previous) => ({ ...previous, mode: "live" }));
      return;
    }
    void enableGps();
  };

  const progressPercent =
    totalDistanceMiles > 0
      ? Math.min(100, Math.round((tracking.progressMiles / totalDistanceMiles) * 100))
      : 0;

  return (
    <section data-testid="live-trip-tracker" className={ui.panel}>
      <h2 className={ui.h2}>Live Trip Tracker</h2>
      {startPlace && destinationPlace ? (
        <div
          className={`mt-3 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3`}
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
