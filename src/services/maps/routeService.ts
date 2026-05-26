import { formatDriveTime } from "@/services/trip/calculateTrip";
import { getMockDistance } from "@/services/trip/mockDistance";
import { geocodeZip, getDrivingRoute, isMapboxConfigured, MapboxClientError } from "./mapboxClient";
import type { RouteData, RouteErrorCode } from "./types";

const US_ZIP_PATTERN = /^\d{5}$/;
const CACHE_TTL_MS = 5 * 60 * 1000;
const METERS_PER_MILE = 1609.344;
const AVERAGE_SPEED_MPH = 60;

const ZIP_COORDINATES: Record<string, { lng: number; lat: number; label: string }> = {
  "33301": { lng: -80.1373, lat: 26.1224, label: "Fort Lauderdale, FL 33301" },
  "98402": { lng: -122.4598, lat: 47.2529, label: "Tacoma, WA 98402" },
};

type CacheEntry = {
  expiresAt: number;
  data: RouteData;
};

const routeCache = new Map<string, CacheEntry>();

export class RouteServiceError extends Error {
  constructor(
    message: string,
    public readonly code: RouteErrorCode,
  ) {
    super(message);
    this.name = "RouteServiceError";
  }
}

export function validateUsZip(zip: string): boolean {
  return US_ZIP_PATTERN.test(zip.trim());
}

function cacheKey(startZip: string, destinationZip: string): string {
  return `${startZip.trim()}|${destinationZip.trim()}`;
}

function readCache(key: string): RouteData | null {
  const entry = routeCache.get(key);
  if (!entry) {
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    routeCache.delete(key);
    return null;
  }
  return entry.data;
}

function writeCache(key: string, data: RouteData): void {
  routeCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

function metersToMiles(meters: number): number {
  return Math.round(meters / METERS_PER_MILE);
}

function interpolatePolyline(
  start: { lng: number; lat: number },
  end: { lng: number; lat: number },
  segments = 24,
): [number, number][] {
  const coordinates: [number, number][] = [];
  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    coordinates.push([
      start.lng + (end.lng - start.lng) * t,
      start.lat + (end.lat - start.lat) * t,
    ]);
  }
  return coordinates;
}

function getFallbackCoordinates(zip: string): { lng: number; lat: number; label: string } {
  const known = ZIP_COORDINATES[zip.trim()];
  if (known) {
    return known;
  }
  const hash = zip.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return {
    lng: -98 + (hash % 20),
    lat: 35 + (hash % 10),
    label: `ZIP ${zip}`,
  };
}

function shouldUseFallback(): boolean {
  return (
    process.env.ROUTE_FORCE_FALLBACK === "true" ||
    !isMapboxConfigured()
  );
}

function buildFallbackRoute(startZip: string, destinationZip: string): RouteData {
  const start = getFallbackCoordinates(startZip);
  const end = getFallbackCoordinates(destinationZip);
  const distanceMiles = getMockDistance(startZip, destinationZip);
  const durationSeconds = Math.round((distanceMiles / AVERAGE_SPEED_MPH) * 3600);

  return {
    distanceMiles,
    durationSeconds,
    etaLabel: formatDriveTime(durationSeconds / 3600),
    polyline: interpolatePolyline(start, end),
    start: { ...start, label: start.label },
    end: { ...end, label: end.label },
    source: "fallback",
  };
}

async function buildMapboxRoute(startZip: string, destinationZip: string): Promise<RouteData> {
  const start = await geocodeZip(startZip);
  const end = await geocodeZip(destinationZip);
  const driving = await getDrivingRoute(start, end);

  const distanceMiles = metersToMiles(driving.distanceMeters);

  return {
    distanceMiles,
    durationSeconds: Math.round(driving.durationSeconds),
    etaLabel: formatDriveTime(driving.durationSeconds / 3600),
    polyline: driving.coordinates,
    start: { lng: start.lng, lat: start.lat, label: start.label },
    end: { lng: end.lng, lat: end.lat, label: end.label },
    source: "mapbox",
  };
}

export async function getRoute(startZip: string, destinationZip: string): Promise<RouteData> {
  const start = startZip.trim();
  const destination = destinationZip.trim();

  if (!validateUsZip(start) || !validateUsZip(destination)) {
    throw new RouteServiceError(
      "Enter valid 5-digit US ZIP codes for start and destination.",
      "INVALID_ZIP",
    );
  }

  const key = cacheKey(start, destination);
  const cached = readCache(key);
  if (cached) {
    return cached;
  }

  let route: RouteData;

  if (shouldUseFallback()) {
    route = buildFallbackRoute(start, destination);
  } else {
    try {
      route = await buildMapboxRoute(start, destination);
    } catch (error) {
      if (error instanceof MapboxClientError) {
        if (error.code === "TIMEOUT") {
          throw new RouteServiceError("Route request timed out. Try again.", "TIMEOUT");
        }
        if (error.code === "MALFORMED") {
          throw new RouteServiceError("Could not resolve one or both ZIP codes.", "INVALID_ZIP");
        }
        route = buildFallbackRoute(start, destination);
      } else {
        throw error;
      }
    }
  }

  writeCache(key, route);
  return route;
}
