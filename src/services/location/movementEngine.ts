import type { LocationSample, MovementSnapshot, MovementState } from "./types";

const METERS_PER_MILE = 1609.344;
const MPH_PER_MPS = 2.23694;

const DRIVING_THRESHOLD_MPH = 8;
const REST_CANDIDATE_MINUTES = 10;
const REST_STOP_MINUTES = 45;
const SLEEP_STOP_MINUTES = 360;

export function mpsToMph(speedMps: number): number {
  return speedMps * MPH_PER_MPS;
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function distanceMilesBetween(a: LocationSample, b: LocationSample): number {
  const earthRadiusMeters = 6_371_000;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const haversine =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const arc = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  const distanceMeters = earthRadiusMeters * arc;
  return distanceMeters / METERS_PER_MILE;
}

export function classifyMovement(speedMph: number, idleMinutes: number): MovementState {
  if (speedMph > DRIVING_THRESHOLD_MPH) {
    return "driving";
  }
  if (idleMinutes >= SLEEP_STOP_MINUTES) {
    return "parked";
  }
  if (idleMinutes >= REST_STOP_MINUTES) {
    return "resting";
  }
  if (idleMinutes >= REST_CANDIDATE_MINUTES) {
    return "idle";
  }
  return "stopped";
}

export function updateMovement(input: {
  previousSample: LocationSample | null;
  nextSample: LocationSample;
  previousDistanceMiles: number;
  previousLastMovementAtMs: number | null;
}): MovementSnapshot {
  const speedMph = Math.max(0, mpsToMph(input.nextSample.speedMps));

  let distanceMiles = input.previousDistanceMiles;
  if (input.previousSample) {
    const deltaMiles = distanceMilesBetween(input.previousSample, input.nextSample);
    if (Number.isFinite(deltaMiles) && deltaMiles > 0) {
      distanceMiles += deltaMiles;
    }
  }

  const movedNow = speedMph > DRIVING_THRESHOLD_MPH;
  const lastMovementAtMs = movedNow
    ? input.nextSample.timestampMs
    : input.previousLastMovementAtMs;
  const idleMinutes =
    lastMovementAtMs === null
      ? 0
      : Math.max(0, (input.nextSample.timestampMs - lastMovementAtMs) / 60_000);

  return {
    movementState: classifyMovement(speedMph, idleMinutes),
    speedMph: Math.round(speedMph),
    idleMinutes: Math.round(idleMinutes),
    totalDistanceMiles: Math.round(distanceMiles * 10) / 10,
    lastMovementAtMs,
  };
}
