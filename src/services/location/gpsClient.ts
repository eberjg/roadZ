import type { GPSPermissionState, LocationSample } from "./types";

export const STALE_LOCATION_MS = 45_000;
export const LOW_ACCURACY_METERS = 120;

export function supportsGeolocation(): boolean {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

export function isSecureLocationContext(): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return true;
  }
  return window.isSecureContext;
}

export function toLocationSample(position: GeolocationPosition): LocationSample {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    speedMps: position.coords.speed ?? 0,
    heading: position.coords.heading ?? null,
    timestampMs: position.timestamp,
  };
}

export function locationIsStale(
  sample: LocationSample | null,
  nowMs: number = Date.now(),
): boolean {
  if (!sample) {
    return true;
  }
  return nowMs - sample.timestampMs > STALE_LOCATION_MS;
}

export async function getPermissionState(): Promise<GPSPermissionState> {
  if (!supportsGeolocation()) {
    return "unsupported";
  }

  if (typeof navigator === "undefined" || !("permissions" in navigator)) {
    return "unknown";
  }

  try {
    const status = await navigator.permissions.query({
      name: "geolocation",
    } as PermissionDescriptor);
    if (status.state === "granted") {
      return "granted";
    }
    if (status.state === "denied") {
      return "denied";
    }
    return "prompt";
  } catch {
    return "unknown";
  }
}

export function startLocationWatch(
  onSuccess: (sample: LocationSample) => void,
  onError: (message: string, code?: "denied" | "unavailable") => void,
): () => void {
  if (!supportsGeolocation()) {
    onError("GPS is not supported on this browser.", "unavailable");
    return () => {};
  }

  if (!isSecureLocationContext()) {
    onError(
      "GPS needs HTTPS on phone browsers. Open this app with a secure URL or localhost.",
      "unavailable",
    );
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => onSuccess(toLocationSample(position)),
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        onError("GPS permission denied by the browser/device.", "denied");
        return;
      }
      onError("GPS unavailable. Check device location services.", "unavailable");
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5_000,
      timeout: 15_000,
    },
  );

  return () => navigator.geolocation.clearWatch(watchId);
}
