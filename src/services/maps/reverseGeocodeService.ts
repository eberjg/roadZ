import { isMapboxConfigured, MapboxClientError, reverseGeocode } from "./mapboxClient";
import type { LngLat } from "./types";

function shouldUseMockReverse(): boolean {
  return process.env.ROUTE_FORCE_FALLBACK === "true";
}

function mockReverseGeocode(lat: number, lng: number): LngLat & { label: string } {
  if (lat > 25 && lat < 27 && lng < -79 && lng > -81) {
    return {
      lat,
      lng,
      label: "Fort Lauderdale, Florida, United States",
    };
  }
  return {
    lat,
    lng,
    label: `Current location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
  };
}

export async function resolveAddressFromCoordinates(
  lat: number,
  lng: number,
): Promise<LngLat & { label: string }> {
  if (shouldUseMockReverse() || !isMapboxConfigured()) {
    return mockReverseGeocode(lat, lng);
  }

  try {
    return await reverseGeocode(lat, lng);
  } catch (error) {
    if (error instanceof MapboxClientError) {
      return mockReverseGeocode(lat, lng);
    }
    throw error;
  }
}
