/** Minimum fuel reserve — never plan below 15% of tank. */
export const FUEL_RESERVE_RATIO = 0.15;

export const DEFAULT_TANK_CAPACITY_GALLONS = 16;
export const DEFAULT_STARTING_FUEL_PERCENT = 100;
export const DEFAULT_AVERAGE_SPEED_MPH = 60;

export const LOW_MPG_THRESHOLD = 20;
export const HIGH_FUEL_PRICE_THRESHOLD = 5;
export const LONG_SEGMENT_MILES = 250;
export const FATIGUE_SEGMENT_MILES = 200;
export const FATIGUE_SEGMENT_HOURS = 3;

export function gallonsPerMile(vehicleMpg: number): number {
  return 1 / vehicleMpg;
}

export function milesPerGallon(vehicleMpg: number): number {
  return vehicleMpg;
}

export function reserveGallons(tankCapacityGallons: number): number {
  return tankCapacityGallons * FUEL_RESERVE_RATIO;
}

export function usableGallons(
  currentFuelGallons: number,
  tankCapacityGallons: number,
): number {
  return Math.max(0, currentFuelGallons - reserveGallons(tankCapacityGallons));
}

export function rangeMilesFromGallons(gallons: number, vehicleMpg: number): number {
  return gallons * vehicleMpg;
}

export function fuelSafetyBufferMiles(
  tankCapacityGallons: number,
  vehicleMpg: number,
): number {
  return rangeMilesFromGallons(reserveGallons(tankCapacityGallons), vehicleMpg);
}

export function gallonsForDistance(distanceMiles: number, vehicleMpg: number): number {
  return distanceMiles / vehicleMpg;
}

export function formatSegmentDriveTime(
  distanceMiles: number,
  averageSpeedMph: number = DEFAULT_AVERAGE_SPEED_MPH,
): string {
  const hours = distanceMiles / averageSpeedMph;
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

export function startingFuelGallons(
  tankCapacityGallons: number,
  startingFuelPercent: number,
): number {
  const clamped = Math.min(100, Math.max(0, startingFuelPercent));
  return (tankCapacityGallons * clamped) / 100;
}
