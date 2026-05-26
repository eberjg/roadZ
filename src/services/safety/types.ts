export type BroadcastEventType =
  | "trip_started"
  | "progress_milestone"
  | "fuel_stop"
  | "overnight_stop"
  | "severe_weather"
  | "eta_drift"
  | "high_fatigue"
  | "arrival"
  | "emergency_suggestion";

export type UpdateFrequency = "every_50_miles" | "every_100_miles" | "every_200_miles";

export type TrustedContact = {
  id: string;
  name: string;
  phone: string;
  enabled: boolean;
};

export type SafetyPreferences = {
  relayEnabled: boolean;
  emergencyOnly: boolean;
  updateFrequency: UpdateFrequency;
  driverDisplayName: string;
};

export type BroadcastMessage = {
  eventType: BroadcastEventType;
  body: string;
  createdAtMs: number;
};

export type RelayDeliveryMode = "twilio" | "simulated";

export type RelaySendResult = {
  ok: boolean;
  mode: RelayDeliveryMode;
  contactId: string;
  messageId?: string;
  error?: string;
};

export type LastBroadcastRecord = {
  body: string;
  eventType: BroadcastEventType;
  sentAtMs: number;
  contactCount: number;
  mode: RelayDeliveryMode;
};

export type SafetyRelayState = {
  tripId: string;
  lastMilestoneMiles: number;
  lastEtaMinutes: number | null;
  sentEventKeys: string[];
  lastBroadcast: LastBroadcastRecord | null;
  gpsLostSinceMs: number | null;
  lastProgressMs: number;
};

export type EmergencySuggestion = {
  active: boolean;
  reasons: string[];
  message: string;
};

export type SafetyStatus = {
  relayEnabled: boolean;
  activeContacts: number;
  mode: RelayDeliveryMode;
  lastBroadcast: LastBroadcastRecord | null;
  emergency: EmergencySuggestion;
};

export type TripBroadcastContext = {
  driverName: string;
  startPlace: string;
  destinationPlace: string;
  currentPlaceLabel: string;
  totalDistanceMiles: number;
  completedDistanceMiles: number;
  etaLabel: string;
  fuelRangeMiles: number;
  weatherRisk: string;
  weatherSummary: string;
  fatigueStatus: string;
  operationalStatus: string;
  nextStopName: string | null;
  isOvernightStop: boolean;
  gpsStale: boolean;
  tripStalled: boolean;
};

export const defaultSafetyPreferences: SafetyPreferences = {
  relayEnabled: false,
  emergencyOnly: false,
  updateFrequency: "every_100_miles",
  driverDisplayName: "Driver",
};
