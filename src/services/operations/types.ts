import type { FuelIntelligence } from "@/services/fuel/types";

export type OperationalStatus = "NORMAL" | "CAUTION" | "HIGH_RISK" | "CRITICAL";

export type TripProgress = {
  totalDistanceMiles: number;
  completedDistanceMiles: number;
  remainingDistanceMiles: number;
  completionPercent: number;
  estimatedArrivalLabel: string;
  drivingSessionDurationLabel: string;
  drivingSessionHours: number;
  nextStopEtaLabel: string | null;
};

export type DriverFatigue = {
  status: OperationalStatus;
  score: number;
  effectiveDrivingHours: number;
  hoursSinceLastStop: number;
  message: string;
};

export type OperationalAlert = {
  id: string;
  code: string;
  message: string;
  severity: OperationalStatus;
};

export type TimelineEventType =
  | "start"
  | "fuel"
  | "rest"
  | "sleep"
  | "arrival";

export type TimelineEvent = {
  id: string;
  type: TimelineEventType;
  label: string;
  mileMarker: number;
  timeLabel: string;
  completed: boolean;
};

export type OperationalState = {
  status: OperationalStatus;
  progress: TripProgress;
  fatigue: DriverFatigue;
  alerts: OperationalAlert[];
  timeline: TimelineEvent[];
};

export type OperationsInput = {
  totalDistanceMiles: number;
  routeEtaLabel: string;
  completedDistanceMiles: number;
  averageSpeedMph?: number;
  fuelIntelligence: FuelIntelligence;
  stopEventsCount?: number;
};
