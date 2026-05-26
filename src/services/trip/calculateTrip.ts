import { getMockDistance } from "./mockDistance";
import type { TripInput, TripResult } from "./types";

/** Average highway speed for deterministic drive-time estimates. */
export const AVERAGE_SPEED_MPH = 60;

export function formatDriveTime(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) {
    return `${m} min`;
  }
  if (m === 0) {
    return `${h} hr`;
  }
  return `${h} hr ${m} min`;
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export type RouteMetrics = {
  distanceMiles: number;
  durationSeconds?: number;
};

/**
 * Trip calculations using live route metrics when provided, otherwise mock distance.
 */
export function calculateTrip(input: TripInput, routeMetrics?: RouteMetrics): TripResult {
  const distanceMiles =
    routeMetrics?.distanceMiles ?? getMockDistance(input.startZip, input.destinationZip);
  const gallonsNeeded = distanceMiles / input.vehicleMpg;
  const fuelCost = gallonsNeeded * input.gasPrice;
  const driveTimeHours =
    routeMetrics?.durationSeconds !== undefined
      ? routeMetrics.durationSeconds / 3600
      : distanceMiles / AVERAGE_SPEED_MPH;

  return {
    distanceMiles: roundTo(distanceMiles, 0),
    gallonsNeeded: roundTo(gallonsNeeded, 1),
    fuelCost: roundTo(fuelCost, 2),
    driveTimeHours: roundTo(driveTimeHours, 2),
    driveTimeLabel: formatDriveTime(driveTimeHours),
  };
}
