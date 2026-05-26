import type { MovementState, SessionSnapshot } from "./types";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export function buildInitialSession(): SessionSnapshot {
  return {
    activeDrivingMs: 0,
    breakMs: 0,
    sleepEstimateMs: 0,
    totalOperationalMs: 0,
    rollingFatigueHours: 0,
  };
}

export function updateSession(input: {
  previous: SessionSnapshot;
  movementState: MovementState;
  deltaMs: number;
  idleMinutes: number;
}): SessionSnapshot {
  const delta = Math.max(0, input.deltaMs);
  const next: SessionSnapshot = {
    ...input.previous,
    totalOperationalMs: input.previous.totalOperationalMs + delta,
  };

  if (input.movementState === "driving") {
    next.activeDrivingMs += delta;
  } else {
    next.breakMs += delta;
  }

  if (input.idleMinutes >= 360) {
    next.sleepEstimateMs += delta;
  }

  const fatigueMs = Math.max(0, next.activeDrivingMs - next.breakMs / 2);
  next.rollingFatigueHours = Math.round((fatigueMs / TWO_HOURS_MS) * 10) / 10;

  if (next.sleepEstimateMs >= SIX_HOURS_MS) {
    next.rollingFatigueHours = Math.max(0, next.rollingFatigueHours - 2);
  }

  return next;
}

export function formatDurationLabel(durationMs: number): string {
  const totalMinutes = Math.floor(durationMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes} min`;
  }
  if (minutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${minutes} min`;
}
