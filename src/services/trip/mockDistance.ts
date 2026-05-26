/** Fallback distance when ZIP pair is not in the mock lookup table. */
export const FALLBACK_MOCK_DISTANCE_MILES = 500;

const ROUTE_DISTANCE_LOOKUP: Record<string, number> = {
  "33301|98402": 3300,
  "98402|33301": 3300,
};

function normalizeZip(zip: string): string {
  return zip.trim();
}

function routeKey(startZip: string, destinationZip: string): string {
  return `${normalizeZip(startZip)}|${normalizeZip(destinationZip)}`;
}

/**
 * Deterministic mock distance lookup. No external APIs.
 */
export function getMockDistance(startZip: string, destinationZip: string): number {
  const key = routeKey(startZip, destinationZip);
  return ROUTE_DISTANCE_LOOKUP[key] ?? FALLBACK_MOCK_DISTANCE_MILES;
}
