/** Parse labels like "55 hr", "2 hr 30 min", "45 min" into total minutes. */
export function parseEtaLabelToMinutes(etaLabel: string): number | null {
  const normalized = etaLabel.toLowerCase().trim();
  if (!normalized) {
    return null;
  }

  const hourMatch = normalized.match(/(\d+)\s*hr/);
  const minMatch = normalized.match(/(\d+)\s*min/);

  const hours = hourMatch ? Number.parseInt(hourMatch[1], 10) : 0;
  const minutes = minMatch ? Number.parseInt(minMatch[1], 10) : 0;

  if (!hourMatch && !minMatch) {
    return null;
  }

  return hours * 60 + minutes;
}

export function etaDriftExceeded(
  previousMinutes: number | null,
  nextMinutes: number | null,
  thresholdMinutes = 45,
): boolean {
  if (previousMinutes === null || nextMinutes === null) {
    return false;
  }
  return Math.abs(nextMinutes - previousMinutes) >= thresholdMinutes;
}

export function estimateRemainingEtaMinutes(input: {
  remainingMiles: number;
  averageSpeedMph?: number;
}): number {
  const speed = input.averageSpeedMph ?? 60;
  return Math.round((input.remainingMiles / speed) * 60);
}
