"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getPermissionState,
  requestLocationAccess,
  startLocationWatch,
  supportsGeolocation,
} from "@/services/location/gpsClient";
import {
  getStoredPermissionState,
  setStoredPermissionState,
} from "@/services/preferences/appStorage";
import {
  applyLocationUpdate,
  applyPermissionState,
  applyTrackingError,
  buildInitialTrackingState,
} from "@/services/location/tripTracker";
import type { LocationSample, TripTrackingState } from "@/services/location/types";

type UseTripLocationTrackingOptions = {
  totalDistanceMiles: number;
  liveDataEnabled: boolean;
  initialProgressMiles: number;
  onAutoProgress: (miles: number) => void;
  onModeChange: (mode: "live" | "manual") => void;
  onLocationSample?: (sample: LocationSample) => void;
};

export function useTripLocationTracking({
  totalDistanceMiles,
  liveDataEnabled,
  initialProgressMiles,
  onAutoProgress,
  onModeChange,
  onLocationSample,
}: UseTripLocationTrackingOptions) {
  const [tracking, setTracking] = useState<TripTrackingState>(() => ({
    ...buildInitialTrackingState(),
    progressMiles: initialProgressMiles,
    mode: "manual",
  }));
  const [gpsSampleAgeMs, setGpsSampleAgeMs] = useState<number | null>(null);

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
        setTracking((previous) => ({
          ...applyPermissionState(previous, "prompt"),
          error:
            "Location was blocked earlier. If Safari already shows Allow, reload this page, then tap Enable GPS.",
        }));
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
        setGpsSampleAgeMs(0);
        setTracking((previous) =>
          applyLocationUpdate({
            previous,
            sample,
            totalDistanceMiles,
          }),
        );
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

  useEffect(() => {
    const sample = tracking.currentSample;
    if (!sample || tracking.mode !== "live") {
      return;
    }
    const tick = () => {
      setGpsSampleAgeMs(Date.now() - sample.timestampMs);
    };
    tick();
    const id = window.setInterval(tick, 10_000);
    return () => window.clearInterval(id);
  }, [tracking.currentSample, tracking.mode]);

  const enableGps = useCallback(async () => {
    if (!supportsGeolocation()) {
      setTracking((previous) =>
        applyTrackingError(previous, "Geolocation is not supported on this browser."),
      );
      return;
    }

    const hadStaleDenial = getStoredPermissionState() === "denied";
    setStoredPermissionState("prompt");

    setTracking((previous) => ({
      ...previous,
      error: null,
      permission: "prompt",
    }));

    const access = await requestLocationAccess({
      recovery: hadStaleDenial,
    });
    if (!access.ok) {
      setTracking((previous) => {
        const next = applyPermissionState(previous, "prompt");
        return applyTrackingError(next, access.message);
      });
      return;
    }

    setStoredPermissionState("granted");
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
  }, [onLocationSample, totalDistanceMiles]);

  const useManual = useCallback(() => {
    setTracking((previous) => ({ ...previous, mode: "manual" }));
  }, []);

  const useLive = useCallback(() => {
    if (tracking.permission === "granted") {
      setTracking((previous) => ({ ...previous, mode: "live" }));
      return;
    }
    void enableGps();
  }, [tracking.permission, enableGps]);

  return {
    tracking,
    enableGps,
    useManual,
    useLive,
    gpsSampleAgeMs,
  };
}
