"use client";

import { useEffect, useState } from "react";
import {
  getPermissionState,
  requestLocationAccess,
  startLocationWatch,
  supportsGeolocation,
} from "@/services/location/gpsClient";
import {
  applyLocationUpdate,
  applyPermissionState,
  applyTrackingError,
  buildInitialTrackingState,
} from "@/services/location/tripTracker";
import type { TripTrackingState } from "@/services/location/types";
import { DrivingSession } from "./DrivingSession";
import { GPSStatus } from "./GPSStatus";
import { MovementStatus } from "./MovementStatus";

type LiveTripTrackerProps = {
  totalDistanceMiles: number;
  onAutoProgress: (miles: number) => void;
  onModeChange: (mode: "live" | "manual") => void;
};

export function LiveTripTracker({
  totalDistanceMiles,
  onAutoProgress,
  onModeChange,
}: LiveTripTrackerProps) {
  const [tracking, setTracking] = useState<TripTrackingState>(buildInitialTrackingState);

  useEffect(() => {
    async function setup() {
      const permission = await getPermissionState();
      setTracking((previous) => applyPermissionState(previous, permission));
    }
    void setup();

    return () => {
      return;
    };
  }, []);

  useEffect(() => {
    if (tracking.mode !== "live" || tracking.permission !== "granted") {
      return;
    }

    const stopWatch = startLocationWatch(
      (sample) => {
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
  }, [tracking.mode, tracking.permission, totalDistanceMiles, onAutoProgress, onModeChange]);

  useEffect(() => {
    onAutoProgress(tracking.progressMiles);
  }, [tracking.progressMiles, onAutoProgress]);

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

  return (
    <section
      data-testid="live-trip-tracker"
      className="rounded-2xl border-2 border-zinc-900 bg-zinc-50 p-4 shadow-sm"
    >
      <h2 className="text-2xl font-bold text-zinc-900">Live Trip Tracker</h2>
      <p className="mt-1 text-lg text-zinc-700">
        Mode: <span data-testid="tracker-mode">{tracking.mode}</span>
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
