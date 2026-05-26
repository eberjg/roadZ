export type GPSPermissionState =
  | "unknown"
  | "prompt"
  | "granted"
  | "denied"
  | "unsupported";

export type GPSHealthState =
  | "good"
  | "acquiring"
  | "stale"
  | "low_accuracy"
  | "denied"
  | "unavailable";

export type MovementState = "driving" | "stopped" | "idle" | "resting" | "parked";

export type LocationSample = {
  latitude: number;
  longitude: number;
  accuracy: number;
  speedMps: number;
  heading: number | null;
  timestampMs: number;
};

export type MovementSnapshot = {
  movementState: MovementState;
  speedMph: number;
  idleMinutes: number;
  totalDistanceMiles: number;
  lastMovementAtMs: number | null;
};

export type SessionSnapshot = {
  activeDrivingMs: number;
  breakMs: number;
  sleepEstimateMs: number;
  totalOperationalMs: number;
  rollingFatigueHours: number;
};

export type TripTrackingState = {
  mode: "live" | "manual";
  permission: GPSPermissionState;
  gpsHealth: GPSHealthState;
  currentSample: LocationSample | null;
  progressMiles: number;
  speedMph: number;
  heading: number | null;
  idleMinutes: number;
  movementState: MovementState;
  lastMovementAtMs: number | null;
  session: SessionSnapshot;
  error: string | null;
};
