import type { LngLat, RouteData } from "@/services/maps/types";
import type { TripInput, TripResult } from "@/services/trip/types";

const SESSION_KEY = "rc_active_trip_session";
const SESSION_VERSION = 1;
const MAX_AGE_MS = 72 * 60 * 60 * 1000;
const SESSION_EVENT = "rc-trip-session";

let sessionCache: PersistedTripSession | null | undefined;
let sessionCacheKey: string | null | undefined;

function invalidateSessionCache(): void {
  sessionCache = undefined;
  sessionCacheKey = undefined;
}

function notifySessionChange(): void {
  if (typeof window === "undefined") {
    return;
  }
  invalidateSessionCache();
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function subscribeTripSession(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener(SESSION_EVENT, onStoreChange);
  return () => window.removeEventListener(SESSION_EVENT, onStoreChange);
}

export type PersistedTripSession = {
  version: typeof SESSION_VERSION;
  savedAtMs: number;
  input: TripInput;
  result: TripResult;
  route: RouteData;
  completedDistanceMiles: number;
  trackerMode: "live" | "manual";
  /** Last map position — resume navigation view after reopen */
  lastKnownPosition?: LngLat | null;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function parseTripSession(raw: string | null): PersistedTripSession | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as PersistedTripSession;
    if (parsed.version !== SESSION_VERSION) {
      return null;
    }
    if (Date.now() - parsed.savedAtMs > MAX_AGE_MS) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    const hasPlaces =
      Boolean(parsed.input?.startPlace) && Boolean(parsed.input?.destinationPlace);
    const hasZips =
      Boolean(parsed.input?.startZip) && Boolean(parsed.input?.destinationZip);
    if ((!hasPlaces && !hasZips) || !parsed.route?.distanceMiles) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function loadTripSession(): PersistedTripSession | null {
  if (!canUseStorage()) {
    return null;
  }
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (sessionCache !== undefined && sessionCacheKey === raw) {
    return sessionCache;
  }
  const next = parseTripSession(raw);
  sessionCache = next;
  sessionCacheKey = raw;
  return next;
}

function sessionPayload(
  session: Omit<PersistedTripSession, "version" | "savedAtMs">,
): PersistedTripSession {
  return {
    version: SESSION_VERSION,
    savedAtMs: Date.now(),
    ...session,
  };
}

function sessionContentKey(session: Omit<PersistedTripSession, "version" | "savedAtMs">): string {
  return JSON.stringify({
    input: session.input,
    result: session.result,
    route: session.route,
    completedDistanceMiles: session.completedDistanceMiles,
    trackerMode: session.trackerMode,
    lastKnownPosition: session.lastKnownPosition ?? null,
  });
}

export function saveTripSession(session: Omit<PersistedTripSession, "version" | "savedAtMs">): void {
  if (!canUseStorage()) {
    return;
  }
  const existing = loadTripSession();
  if (existing && sessionContentKey(session) === sessionContentKey(existing)) {
    return;
  }
  const payload = sessionPayload(session);
  const serialized = JSON.stringify(payload);
  window.localStorage.setItem(SESSION_KEY, serialized);
  notifySessionChange();
}

export function clearTripSession(): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.removeItem(SESSION_KEY);
  notifySessionChange();
}
