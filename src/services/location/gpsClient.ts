import type { GPSPermissionState, LocationSample } from "./types";

export const STALE_LOCATION_MS = 45_000;
export const LOW_ACCURACY_METERS = 120;

const IOS_RELOAD_HINT =
  "If Safari already shows Location → Allow, reload this page, then tap Try again. Also check iPhone Settings → Privacy → Location Services.";

export type LocationAccessOptions = {
  /**
   * After the user fixes Safari Website Settings, iOS may still return errors until
   * reload. Try cached/low-accuracy reads before treating access as denied.
   */
  recovery?: boolean;
};

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

export type LocationAccessResult =
  | { ok: true; sample: LocationSample }
  | { ok: false; code: "denied" | "unavailable"; message: string };

/** iOS Safari often mis-reports geolocation as denied before any prompt. */
function permissionsApiSaysDenied(state: PermissionState): boolean {
  return state === "denied";
}

function deniedMessage(): string {
  return `GPS permission denied. ${IOS_RELOAD_HINT}`;
}

function getCurrentPositionAttempt(options: {
  enableHighAccuracy: boolean;
  maximumAge: number;
  timeout: number;
}): Promise<LocationAccessResult> {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({ ok: true, sample: toLocationSample(position) });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          resolve({
            ok: false,
            code: "denied",
            message: deniedMessage(),
          });
          return;
        }
        resolve({
          ok: false,
          code: "unavailable",
          message: "GPS unavailable. Check device location services.",
        });
      },
      {
        enableHighAccuracy: options.enableHighAccuracy,
        maximumAge: options.maximumAge,
        timeout: options.timeout,
      },
    );
  });
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
    if (permissionsApiSaysDenied(status.state)) {
      // Do not trust "denied" here — only getCurrentPosition after a user tap is reliable on iOS.
      return "prompt";
    }
    return "prompt";
  } catch {
    return "unknown";
  }
}

/** Call from a button click — triggers the native location prompt on iOS. */
export async function requestLocationAccess(
  options?: LocationAccessOptions,
): Promise<LocationAccessResult> {
  if (!supportsGeolocation()) {
    return {
      ok: false,
      code: "unavailable",
      message: "GPS is not supported on this browser.",
    };
  }

  if (!isSecureLocationContext()) {
    return {
      ok: false,
      code: "unavailable",
      message:
        "GPS needs HTTPS on phone browsers. Open this app with a secure URL or localhost.",
    };
  }

  const attempts: Array<{ enableHighAccuracy: boolean; maximumAge: number }> =
    options?.recovery
      ? [
          { enableHighAccuracy: true, maximumAge: 120_000 },
          { enableHighAccuracy: false, maximumAge: 120_000 },
          { enableHighAccuracy: true, maximumAge: 0 },
        ]
      : [{ enableHighAccuracy: true, maximumAge: 0 }];

  let lastResult: LocationAccessResult | null = null;

  for (const attempt of attempts) {
    const result = await getCurrentPositionAttempt({
      ...attempt,
      timeout: 25_000,
    });
    if (result.ok) {
      return result;
    }
    lastResult = result;
  }

  return (
    lastResult ?? {
      ok: false,
      code: "unavailable",
      message: "GPS unavailable. Check device location services.",
    }
  );
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
        onError(deniedMessage(), "denied");
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
