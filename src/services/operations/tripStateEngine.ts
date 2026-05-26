import { DEFAULT_AVERAGE_SPEED_MPH } from "@/services/fuel/fuelMath";
import { formatDriveTime } from "@/services/trip/calculateTrip";
import { buildOperationalAlerts } from "./alertEngine";
import { buildDriverFatigue } from "./fatigueEngine";
import {
  buildTripProgress,
  clampCompletedDistance,
  countPassedStops,
} from "./progressEngine";
import type {
  OperationsInput,
  OperationalState,
  OperationalStatus,
  TimelineEvent,
} from "./types";

const SLEEP_STOP_HOUR = 10;

function worstStatus(statuses: OperationalStatus[]): OperationalStatus {
  const order: OperationalStatus[] = ["NORMAL", "CAUTION", "HIGH_RISK", "CRITICAL"];
  let worst: OperationalStatus = "NORMAL";
  for (const status of statuses) {
    if (order.indexOf(status) > order.indexOf(worst)) {
      worst = status;
    }
  }
  return worst;
}

export function buildTimeline(
  input: OperationsInput,
  completedDistanceMiles: number,
  averageSpeedMph: number = DEFAULT_AVERAGE_SPEED_MPH,
): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: "timeline-start",
      type: "start",
      label: "Trip start",
      mileMarker: 0,
      timeLabel: "0 mi",
      completed: completedDistanceMiles > 0,
    },
  ];

  for (const stop of input.fuelIntelligence.plannedStops) {
    const isFood = stop.station.foodAvailable;
    events.push({
      id: `timeline-${stop.station.id}`,
      type: isFood ? "rest" : "fuel",
      label: isFood ? `Rest · ${stop.station.name}` : `Fuel · ${stop.station.name}`,
      mileMarker: stop.mileMarker,
      timeLabel: formatDriveTime(stop.mileMarker / averageSpeedMph),
      completed: stop.mileMarker <= completedDistanceMiles,
    });
  }

  const sleepMile = SLEEP_STOP_HOUR * averageSpeedMph;
  if (sleepMile < input.totalDistanceMiles) {
    events.push({
      id: "timeline-sleep",
      type: "sleep",
      label: "Estimated sleep stop",
      mileMarker: sleepMile,
      timeLabel: formatDriveTime(SLEEP_STOP_HOUR),
      completed: completedDistanceMiles >= sleepMile,
    });
  }

  events.push({
    id: "timeline-arrival",
    type: "arrival",
    label: "Estimated arrival",
    mileMarker: input.totalDistanceMiles,
    timeLabel: input.routeEtaLabel,
    completed: completedDistanceMiles >= input.totalDistanceMiles,
  });

  return events.sort((a, b) => a.mileMarker - b.mileMarker);
}

export function buildOperationalState(input: OperationsInput): OperationalState {
  const averageSpeed = input.averageSpeedMph ?? DEFAULT_AVERAGE_SPEED_MPH;
  const completed = clampCompletedDistance(
    input.completedDistanceMiles,
    input.totalDistanceMiles,
  );
  const stopEventsCount =
    input.stopEventsCount ?? countPassedStops(input.fuelIntelligence, completed);

  const progress = buildTripProgress(
    input.totalDistanceMiles,
    completed,
    input.fuelIntelligence,
    averageSpeed,
  );
  const fatigue = buildDriverFatigue(
    completed,
    input.fuelIntelligence,
    stopEventsCount,
    averageSpeed,
  );
  const alerts = buildOperationalAlerts(progress, fatigue, input.fuelIntelligence);
  const timeline = buildTimeline(input, completed, averageSpeed);

  const status = worstStatus([fatigue.status, ...alerts.map((alert) => alert.severity)]);

  return {
    status,
    progress,
    fatigue,
    alerts,
    timeline,
  };
}
