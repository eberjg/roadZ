import { locationIsStale, LOW_ACCURACY_METERS } from "./gpsClient";
import { updateMovement } from "./movementEngine";
import { buildInitialSession, updateSession } from "./sessionEngine";
import type { GPSHealthState, LocationSample, TripTrackingState } from "./types";

export function buildInitialTrackingState(): TripTrackingState {
  return {
    mode: "manual",
    permission: "unknown",
    gpsHealth: "unavailable",
    currentSample: null,
    progressMiles: 0,
    speedMph: 0,
    heading: null,
    idleMinutes: 0,
    movementState: "stopped",
    lastMovementAtMs: null,
    session: buildInitialSession(),
    error: null,
  };
}

function deriveGpsHealth(sample: LocationSample | null, permission: TripTrackingState["permission"]): GPSHealthState {
  if (permission === "denied") {
    return "denied";
  }
  if (!sample) {
    return "unavailable";
  }
  if (locationIsStale(sample)) {
    return "stale";
  }
  if (sample.accuracy > LOW_ACCURACY_METERS) {
    return "low_accuracy";
  }
  return "good";
}

export function applyLocationUpdate(input: {
  previous: TripTrackingState;
  sample: LocationSample;
  totalDistanceMiles: number;
}): TripTrackingState {
  const movement = updateMovement({
    previousSample: input.previous.currentSample,
    nextSample: input.sample,
    previousDistanceMiles: input.previous.progressMiles,
    previousLastMovementAtMs: input.previous.lastMovementAtMs,
  });

  const deltaMs = input.previous.currentSample
    ? Math.max(0, input.sample.timestampMs - input.previous.currentSample.timestampMs)
    : 0;
  const session = updateSession({
    previous: input.previous.session,
    movementState: movement.movementState,
    deltaMs,
    idleMinutes: movement.idleMinutes,
  });

  const progressMiles = Math.min(input.totalDistanceMiles, movement.totalDistanceMiles);
  const shouldAutoResume =
    input.previous.mode === "manual" && movement.movementState === "driving";

  const nextMode = shouldAutoResume ? "live" : input.previous.mode;

  return {
    ...input.previous,
    mode: nextMode,
    currentSample: input.sample,
    progressMiles,
    speedMph: movement.speedMph,
    heading: input.sample.heading,
    idleMinutes: movement.idleMinutes,
    movementState: movement.movementState,
    lastMovementAtMs: movement.lastMovementAtMs,
    session,
    gpsHealth: deriveGpsHealth(input.sample, input.previous.permission),
    error: null,
  };
}

export function applyPermissionState(
  previous: TripTrackingState,
  permission: TripTrackingState["permission"],
): TripTrackingState {
  return {
    ...previous,
    permission,
    gpsHealth: deriveGpsHealth(previous.currentSample, permission),
    mode: permission === "granted" ? previous.mode : "manual",
  };
}

export function applyTrackingError(
  previous: TripTrackingState,
  message: string,
): TripTrackingState {
  return {
    ...previous,
    mode: "manual",
    error: message,
    gpsHealth: previous.permission === "denied" ? "denied" : "unavailable",
  };
}
