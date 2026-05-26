"use client";

import { useEffect, useRef, useState } from "react";
import { processSafetyRelay } from "@/services/safety/safetyEngine";
import type { EmergencySuggestion, TripBroadcastContext } from "@/services/safety/types";

export function useSafetyRelay(input: {
  tripId: string;
  context: TripBroadcastContext;
  stopCount: number;
  enabled: boolean;
  gpsSampleAgeMs: number | null;
}) {
  const [emergency, setEmergency] = useState<EmergencySuggestion>({
    active: false,
    reasons: [],
    message: "No elevated safety concerns right now.",
  });
  const [lastPreview, setLastPreview] = useState<string | null>(null);
  const previousMilesRef = useRef(input.context.completedDistanceMiles);
  const previousStopCountRef = useRef(input.stopCount);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!input.enabled) {
      return;
    }

    const run = async () => {
      const previousMiles = mountedRef.current
        ? previousMilesRef.current
        : input.context.completedDistanceMiles;
      const previousStops = mountedRef.current
        ? previousStopCountRef.current
        : input.stopCount;

      const result = await processSafetyRelay({
        tripId: input.tripId,
        context: input.context,
        previousCompletedMiles: previousMiles,
        stopCount: input.stopCount,
        previousStopCount: previousStops,
        gpsSampleAgeMs: input.gpsSampleAgeMs,
      });

      previousMilesRef.current = input.context.completedDistanceMiles;
      previousStopCountRef.current = input.stopCount;
      mountedRef.current = true;
      setEmergency(result.emergency);
      setLastPreview(result.previews[result.previews.length - 1] ?? null);
    };

    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- context fields listed explicitly to avoid object reference loops
  }, [
    input.enabled,
    input.tripId,
    input.context.completedDistanceMiles,
    input.context.etaLabel,
    input.context.weatherRisk,
    input.context.fatigueStatus,
    input.context.operationalStatus,
    input.context.tripStalled,
    input.context.gpsStale,
    input.context.currentPlaceLabel,
    input.context.nextStopName,
    input.context.isOvernightStop,
    input.stopCount,
    input.gpsSampleAgeMs,
  ]);

  return { emergency, lastPreview };
}
