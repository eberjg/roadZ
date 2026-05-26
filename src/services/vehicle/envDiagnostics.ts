import { isMapboxConfigured } from "@/services/maps/mapboxClient";

export type RuntimeDiagnostics = {
  nodeEnv: string;
  mapboxServerConfigured: boolean;
  mapboxPublicConfigured: boolean;
  routeForceFallback: boolean;
  placesForceMock: boolean;
  weatherForceMock: boolean;
  secureContext: boolean;
};

export function getRuntimeDiagnostics(): RuntimeDiagnostics {
  const nodeEnv = process.env.NODE_ENV ?? "unknown";
  return {
    nodeEnv,
    mapboxServerConfigured: isMapboxConfigured(),
    mapboxPublicConfigured: Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim()),
    routeForceFallback: process.env.ROUTE_FORCE_FALLBACK === "true",
    placesForceMock:
      process.env.PLACES_FORCE_MOCK === "true" ||
      process.env.ROUTE_FORCE_FALLBACK === "true",
    weatherForceMock: process.env.WEATHER_FORCE_MOCK === "true",
    secureContext: typeof window !== "undefined" ? window.isSecureContext : true,
  };
}

export function logRuntimeDiagnostics(scope: string): void {
  const diagnostics = getRuntimeDiagnostics();
  if (process.env.NODE_ENV === "production") {
    console.info(`[roadZ:${scope}]`, diagnostics);
    return;
  }
  console.debug(`[roadZ:${scope}]`, diagnostics);
}
