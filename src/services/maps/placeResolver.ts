const US_ZIP_PATTERN = /^\d{5}$/;

/** Pull a 5-digit US ZIP from an address or ZIP string. */
export function extractUsZip(place: string): string | null {
  const match = place.trim().match(/\b(\d{5})(?:-\d{4})?\b/);
  return match?.[1] ?? null;
}

export function isUsZip(place: string): boolean {
  return US_ZIP_PATTERN.test(place.trim());
}

/** Canonical ZIP for APIs/mock lookup, or a stable key from the place text. */
export function resolvePlaceKey(place: string): string {
  const trimmed = place.trim();
  if (isUsZip(trimmed)) {
    return trimmed;
  }
  const zip = extractUsZip(trimmed);
  if (zip) {
    return zip;
  }
  return trimmed.slice(0, 32);
}
