import { milestoneIntervalMiles } from "./contactManager";
import { etaDriftExceeded, parseEtaLabelToMinutes } from "./etaMonitor";
import { buildBroadcastPreview } from "./smsRelay";
import type {
  BroadcastEventType,
  BroadcastMessage,
  SafetyPreferences,
  SafetyRelayState,
  TripBroadcastContext,
} from "./types";

const EMERGENCY_EVENTS: BroadcastEventType[] = [
  "severe_weather",
  "high_fatigue",
  "emergency_suggestion",
];

function eventKey(tripId: string, eventType: BroadcastEventType, suffix = ""): string {
  return `${tripId}:${eventType}${suffix ? `:${suffix}` : ""}`;
}

function shouldSendForPreferences(
  eventType: BroadcastEventType,
  preferences: SafetyPreferences,
): boolean {
  if (!preferences.relayEnabled) {
    return false;
  }
  if (preferences.emergencyOnly) {
    return EMERGENCY_EVENTS.includes(eventType);
  }
  return true;
}

export function createRelayState(tripId: string): SafetyRelayState {
  return {
    tripId,
    lastMilestoneMiles: 0,
    lastEtaMinutes: null,
    sentEventKeys: [],
    lastBroadcast: null,
    gpsLostSinceMs: null,
    lastProgressMs: Date.now(),
  };
}

export function evaluateBroadcastTriggers(input: {
  state: SafetyRelayState;
  context: TripBroadcastContext;
  preferences: SafetyPreferences;
  previousCompletedMiles: number;
  stopCount: number;
  previousStopCount: number;
}): { events: BroadcastEventType[]; nextState: SafetyRelayState } {
  const { state, context, preferences, stopCount, previousStopCount } = input;
  const events: BroadcastEventType[] = [];
  const nextState: SafetyRelayState = {
    ...state,
    lastProgressMs: Date.now(),
  };

  const mark = (eventType: BroadcastEventType, suffix = "") => {
    const key = eventKey(state.tripId, eventType, suffix);
    if (!state.sentEventKeys.includes(key)) {
      events.push(eventType);
      nextState.sentEventKeys = [...nextState.sentEventKeys, key];
    }
  };

  if (!state.sentEventKeys.some((key) => key.includes("trip_started"))) {
    mark("trip_started");
  }

  const interval = milestoneIntervalMiles(preferences.updateFrequency);
  const milestone =
    context.completedDistanceMiles > 0 &&
    context.completedDistanceMiles - state.lastMilestoneMiles >= interval;
  if (milestone) {
    mark("progress_milestone", String(Math.floor(context.completedDistanceMiles / interval)));
    nextState.lastMilestoneMiles =
      Math.floor(context.completedDistanceMiles / interval) * interval;
  }

  if (stopCount > previousStopCount && context.nextStopName) {
    if (context.isOvernightStop) {
      mark("overnight_stop", String(stopCount));
    } else {
      mark("fuel_stop", String(stopCount));
    }
  }

  const etaMinutes = parseEtaLabelToMinutes(context.etaLabel);
  if (etaDriftExceeded(state.lastEtaMinutes, etaMinutes)) {
    mark("eta_drift");
  }
  if (etaMinutes !== null) {
    nextState.lastEtaMinutes = etaMinutes;
  }

  if (
    context.weatherRisk === "HIGH_RISK" ||
    context.weatherRisk === "CRITICAL"
  ) {
    mark("severe_weather");
  }

  if (context.fatigueStatus === "HIGH_RISK" || context.fatigueStatus === "CRITICAL") {
    mark("high_fatigue");
  }

  const arrived =
    context.totalDistanceMiles > 0 &&
    context.completedDistanceMiles >= context.totalDistanceMiles * 0.98;
  if (arrived) {
    mark("arrival");
  }

  return { events, nextState };
}

export function buildMessagesForEvents(
  events: BroadcastEventType[],
  context: TripBroadcastContext,
): BroadcastMessage[] {
  return events.map((eventType) => buildBroadcastPreview(eventType, context));
}

export function filterEventsByPreferences(
  events: BroadcastEventType[],
  preferences: SafetyPreferences,
): BroadcastEventType[] {
  return events.filter((eventType) => shouldSendForPreferences(eventType, preferences));
}
