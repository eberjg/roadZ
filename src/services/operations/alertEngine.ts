import type { FuelIntelligence } from "@/services/fuel/types";
import type { DriverFatigue, OperationalAlert, TripProgress } from "./types";

const EXCESSIVE_DRIVING_HOURS = 8;
const OVERNIGHT_HOURS = 12;
const OVERDUE_REST_HOURS = 3;

export function buildOperationalAlerts(
  progress: TripProgress,
  fatigue: DriverFatigue,
  fuelIntelligence: FuelIntelligence,
): OperationalAlert[] {
  const alerts: OperationalAlert[] = [];

  if (fatigue.status === "CRITICAL" || fatigue.status === "HIGH_RISK") {
    alerts.push({
      id: "fatigue-danger",
      code: "DANGEROUS_FATIGUE",
      message: fatigue.message,
      severity: fatigue.status,
    });
  }

  if (fatigue.hoursSinceLastStop >= OVERDUE_REST_HOURS) {
    alerts.push({
      id: "rest-overdue",
      code: "OVERDUE_REST",
      message: `No rest stop for ${fatigue.hoursSinceLastStop} hours. Take a break.`,
      severity: fatigue.hoursSinceLastStop >= 4 ? "HIGH_RISK" : "CAUTION",
    });
  }

  const nextStop = fuelIntelligence.recommendedNextStop;
  const milesToNextStop = nextStop
    ? nextStop.mileMarker - progress.completedDistanceMiles
    : null;
  if (
    milesToNextStop !== null &&
    progress.completedDistanceMiles > 0 &&
    milesToNextStop > fuelIntelligence.estimatedRangeMiles
  ) {
    alerts.push({
      id: "fuel-low",
      code: "LOW_FUEL_RESERVE",
      message: "Fuel range is below distance to next recommended stop.",
      severity: "HIGH_RISK",
    });
  }

  if (progress.drivingSessionHours >= EXCESSIVE_DRIVING_HOURS) {
    alerts.push({
      id: "driving-excess",
      code: "EXCESSIVE_DRIVING",
      message: `Driving session at ${progress.drivingSessionDurationLabel}. Rotate drivers or rest.`,
      severity: progress.drivingSessionHours >= 10 ? "HIGH_RISK" : "CAUTION",
    });
  }

  const longNoFoodSegment = fuelIntelligence.segments.find(
    (segment) =>
      !segment.hasRestStop &&
      segment.distanceMiles > 200 &&
      segment.startMile >= progress.completedDistanceMiles &&
      segment.startMile < progress.completedDistanceMiles + 300,
  );
  if (longNoFoodSegment) {
    alerts.push({
      id: "no-food-segment",
      code: "LONG_NO_FOOD",
      message: `Upcoming ${longNoFoodSegment.distanceMiles} mi stretch without food services.`,
      severity: "CAUTION",
    });
  }

  if (
    progress.drivingSessionHours >= OVERNIGHT_HOURS &&
    progress.completionPercent < 80
  ) {
    alerts.push({
      id: "overnight-risk",
      code: "OVERNIGHT_DRIVING",
      message: "Extended session with significant distance left. Consider a sleep stop.",
      severity: "HIGH_RISK",
    });
  }

  return alerts;
}
