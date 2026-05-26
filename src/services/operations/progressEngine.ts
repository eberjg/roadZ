import { DEFAULT_AVERAGE_SPEED_MPH } from "@/services/fuel/fuelMath";
import { formatDriveTime } from "@/services/trip/calculateTrip";
import type { FuelIntelligence } from "@/services/fuel/types";
import type { TripProgress } from "./types";

export function clampCompletedDistance(
  completed: number,
  total: number,
): number {
  return Math.min(Math.max(0, completed), total);
}

export function computeDrivingSessionHours(
  completedDistanceMiles: number,
  averageSpeedMph: number = DEFAULT_AVERAGE_SPEED_MPH,
): number {
  return completedDistanceMiles / averageSpeedMph;
}

export function countPassedStops(
  fuelIntelligence: FuelIntelligence,
  completedDistanceMiles: number,
): number {
  return fuelIntelligence.plannedStops.filter(
    (stop) => stop.mileMarker <= completedDistanceMiles,
  ).length;
}

export function milesSinceLastStop(
  fuelIntelligence: FuelIntelligence,
  completedDistanceMiles: number,
): number {
  const passed = fuelIntelligence.plannedStops.filter(
    (stop) => stop.mileMarker <= completedDistanceMiles,
  );
  const lastStopMile = passed.length > 0 ? passed[passed.length - 1].mileMarker : 0;
  return Math.max(0, completedDistanceMiles - lastStopMile);
}

export function buildTripProgress(
  totalDistanceMiles: number,
  completedDistanceMiles: number,
  fuelIntelligence: FuelIntelligence,
  averageSpeedMph: number = DEFAULT_AVERAGE_SPEED_MPH,
): TripProgress {
  const completed = clampCompletedDistance(completedDistanceMiles, totalDistanceMiles);
  const remaining = totalDistanceMiles - completed;
  const completionPercent =
    totalDistanceMiles > 0 ? Math.round((completed / totalDistanceMiles) * 100) : 0;
  const drivingSessionHours = computeDrivingSessionHours(completed, averageSpeedMph);
  const remainingHours = remaining / averageSpeedMph;

  const nextStop = fuelIntelligence.plannedStops.find(
    (stop) => stop.mileMarker > completed,
  );
  const milesToNextStop = nextStop ? nextStop.mileMarker - completed : null;

  return {
    totalDistanceMiles,
    completedDistanceMiles: Math.round(completed),
    remainingDistanceMiles: Math.round(remaining),
    completionPercent,
    estimatedArrivalLabel: formatDriveTime(remainingHours),
    drivingSessionDurationLabel: formatDriveTime(drivingSessionHours),
    drivingSessionHours: Math.round(drivingSessionHours * 10) / 10,
    nextStopEtaLabel:
      milesToNextStop !== null ? formatDriveTime(milesToNextStop / averageSpeedMph) : null,
  };
}
