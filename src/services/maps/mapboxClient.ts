import type {
  MapboxDirectionsResponse,
  MapboxGeocodeResponse,
  LngLat,
} from "./types";

const REQUEST_TIMEOUT_MS = 10_000;
const MAPBOX_BASE = "https://api.mapbox.com";

export class MapboxClientError extends Error {
  constructor(
    message: string,
    public readonly code: "TIMEOUT" | "UNAVAILABLE" | "MALFORMED",
  ) {
    super(message);
    this.name = "MapboxClientError";
  }
}

function getAccessToken(): string | undefined {
  return process.env.MAPBOX_ACCESS_TOKEN?.trim();
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new MapboxClientError("Mapbox request timed out.", "TIMEOUT");
    }
    throw new MapboxClientError("Mapbox request failed.", "UNAVAILABLE");
  } finally {
    clearTimeout(timeoutId);
  }
}

export function isMapboxConfigured(): boolean {
  return Boolean(getAccessToken());
}

export async function geocodeZip(zip: string): Promise<LngLat & { label: string }> {
  const token = getAccessToken();
  if (!token) {
    throw new MapboxClientError("Mapbox token is not configured.", "UNAVAILABLE");
  }

  const encodedZip = encodeURIComponent(zip);
  const url =
    `${MAPBOX_BASE}/geocoding/v5/mapbox.places/${encodedZip}.json` +
    `?country=US&types=postcode&limit=1&access_token=${token}`;

  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new MapboxClientError(`Geocoding failed (${response.status}).`, "UNAVAILABLE");
  }

  const data = (await response.json()) as MapboxGeocodeResponse;
  const feature = data.features?.[0];
  if (!feature?.center) {
    throw new MapboxClientError("ZIP code could not be geocoded.", "MALFORMED");
  }

  const [lng, lat] = feature.center;
  return { lng, lat, label: feature.place_name ?? zip };
}

export async function getDrivingRoute(
  start: LngLat,
  end: LngLat,
): Promise<{ distanceMeters: number; durationSeconds: number; coordinates: [number, number][] }> {
  const token = getAccessToken();
  if (!token) {
    throw new MapboxClientError("Mapbox token is not configured.", "UNAVAILABLE");
  }

  const coordinates = `${start.lng},${start.lat};${end.lng},${end.lat}`;
  const url =
    `${MAPBOX_BASE}/directions/v5/mapbox/driving/${coordinates}` +
    `?geometries=geojson&overview=full&access_token=${token}`;

  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new MapboxClientError(`Directions failed (${response.status}).`, "UNAVAILABLE");
  }

  const data = (await response.json()) as MapboxDirectionsResponse;
  if (data.code !== "Ok" || !data.routes?.[0]) {
    throw new MapboxClientError(data.message ?? "No driving route available.", "UNAVAILABLE");
  }

  const route = data.routes[0];
  return {
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    coordinates: route.geometry.coordinates,
  };
}
