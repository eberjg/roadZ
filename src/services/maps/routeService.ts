import { formatDriveTime } from "@/services/trip/calculateTrip";
import { getMockDistance } from "@/services/trip/mockDistance";
import {
  geocodePlace,
  geocodeZip,
  getDrivingRoute,
  isMapboxConfigured,
  MapboxClientError,
} from "./mapboxClient";
import { isUsZip, resolvePlaceKey } from "./placeResolver";
import type { LngLat, RouteData, RouteErrorCode } from "./types";
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
  return isUsZip(zip);
}

function cacheKey(startPlace: string, destinationPlace: string): string {
  return `${resolvePlaceKey(startPlace)}|${resolvePlaceKey(destinationPlace)}`;
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

function getFallbackCoordinates(place: string): { lng: number; lat: number; label: string } {
  const zipKey = resolvePlaceKey(place);
  const known = ZIP_COORDINATES[zipKey];
  if (known) {
    return { ...known, label: place.trim() || known.label };
  }
  const hash = place.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return {
    lng: -98 + (hash % 20),
    lat: 35 + (hash % 10),
    label: place.trim() || `Place ${zipKey}`,
  };
}

function shouldUseFallback(): boolean {
  return (
    process.env.ROUTE_FORCE_FALLBACK === "true" ||
    !isMapboxConfigured()
  );
}

function buildFallbackRoute(startPlace: string, destinationPlace: string): RouteData {
  const start = getFallbackCoordinates(startPlace);
  const end = getFallbackCoordinates(destinationPlace);
  const distanceMiles = getMockDistance(
    resolvePlaceKey(startPlace),
    resolvePlaceKey(destinationPlace),
  );
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

async function resolvePlace(place: string): Promise<LngLat & { label: string }> {
  if (isUsZip(place)) {
    return geocodeZip(place.trim());
  }
  return geocodePlace(place);
}

async function buildMapboxRoute(startPlace: string, destinationPlace: string): Promise<RouteData> {
  const start = await resolvePlace(startPlace);
  const end = await resolvePlace(destinationPlace);
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

export async function getRoute(startPlace: string, destinationPlace: string): Promise<RouteData> {
  const start = startPlace.trim();
  const destination = destinationPlace.trim();

  if (!start || !destination) {
    throw new RouteServiceError(
      "Enter a start and destination (address or ZIP).",
      "INVALID_PLACE",
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
          throw new RouteServiceError(
            "Could not resolve start or destination. Check the address.",
            "INVALID_PLACE",
          );
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
