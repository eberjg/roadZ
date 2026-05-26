import { DEFAULT_AVERAGE_SPEED_MPH } from "@/services/fuel/fuelMath";
import type { FuelIntelligence } from "@/services/fuel/types";
import { computeDrivingSessionHours, milesSinceLastStop } from "./progressEngine";
import type { DriverFatigue, OperationalStatus } from "./types";

const FATIGUE_STEP_HOURS = 2;
const HIGH_RISK_HOURS = 10;
const CRITICAL_HOURS = 14;
const STOP_RECOVERY_HOURS = 2;
const LONG_NO_STOP_HOURS = 3;

export function hoursToStatus(effectiveHours: number): OperationalStatus {
  if (effectiveHours >= CRITICAL_HOURS) {
    return "CRITICAL";
  }
  if (effectiveHours >= HIGH_RISK_HOURS) {
    return "HIGH_RISK";
  }
  if (effectiveHours >= FATIGUE_STEP_HOURS) {
    return "CAUTION";
  }
  return "NORMAL";
}

export function fatigueScore(effectiveHours: number): number {
  return Math.min(100, Math.round((effectiveHours / CRITICAL_HOURS) * 100));
}

export function buildDriverFatigue(
  completedDistanceMiles: number,
  fuelIntelligence: FuelIntelligence,
  stopEventsCount: number,
  averageSpeedMph: number = DEFAULT_AVERAGE_SPEED_MPH,
): DriverFatigue {
  const drivingSessionHours = computeDrivingSessionHours(
    completedDistanceMiles,
    averageSpeedMph,
  );
  const hoursSinceStop = milesSinceLastStop(fuelIntelligence, completedDistanceMiles) / averageSpeedMph;

  let effectiveDrivingHours = drivingSessionHours - stopEventsCount * STOP_RECOVERY_HOURS;
  effectiveDrivingHours = Math.max(0, effectiveDrivingHours);

  if (hoursSinceStop >= LONG_NO_STOP_HOURS) {
    effectiveDrivingHours += Math.floor(hoursSinceStop - LONG_NO_STOP_HOURS) + 1;
  }

  const status = hoursToStatus(effectiveDrivingHours);
  const score = fatigueScore(effectiveDrivingHours);

  const messages: Record<OperationalStatus, string> = {
    NORMAL: "Driver alertness is in a normal range.",
    CAUTION: "Driving time is building. Plan a break soon.",
    HIGH_RISK: "High fatigue risk. Take a rest stop now.",
    CRITICAL: "Critical fatigue level. Stop driving and rest immediately.",
  };

  return {
    status,
    score,
    effectiveDrivingHours: Math.round(effectiveDrivingHours * 10) / 10,
    hoursSinceLastStop: Math.round(hoursSinceStop * 10) / 10,
    message: messages[status],
  };
}
