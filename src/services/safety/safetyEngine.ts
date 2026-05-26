import {
  getActiveContacts,
  getSafetyPreferences,
} from "./contactManager";
import { broadcastToContacts } from "./smsRelay";
import {
  buildMessagesForEvents,
  createRelayState,
  evaluateBroadcastTriggers,
  filterEventsByPreferences,
} from "./tripBroadcast";
import type {
  EmergencySuggestion,
  LastBroadcastRecord,
  SafetyRelayState,
  SafetyStatus,
  TripBroadcastContext,
} from "./types";

const RELAY_STATE_KEY = "rc_safety_relay_state";
const GPS_LOST_MS = 20 * 60 * 1000;
const STALL_MS = 45 * 60 * 1000;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadRelayState(tripId: string): SafetyRelayState {
  if (!canUseStorage()) {
    return createRelayState(tripId);
  }
  const raw = window.localStorage.getItem(RELAY_STATE_KEY);
  if (!raw) {
    return createRelayState(tripId);
  }
  try {
    const parsed = JSON.parse(raw) as SafetyRelayState;
    if (parsed.tripId !== tripId) {
      return createRelayState(tripId);
    }
    return parsed;
  } catch {
    return createRelayState(tripId);
  }
}

export function saveRelayState(state: SafetyRelayState): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(RELAY_STATE_KEY, JSON.stringify(state));
}

export function clearRelayState(): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.removeItem(RELAY_STATE_KEY);
}

export function evaluateEmergencySuggestion(context: TripBroadcastContext): EmergencySuggestion {
  const reasons: string[] = [];

  if (context.gpsStale) {
    reasons.push("GPS signal lost for an extended period");
  }
  if (context.fatigueStatus === "CRITICAL") {
    reasons.push("Critical driver fatigue detected");
  }
  if (
    (context.weatherRisk === "CRITICAL" || context.weatherRisk === "HIGH_RISK") &&
    context.tripStalled
  ) {
    reasons.push("Severe weather with no recent movement");
  }
  if (context.tripStalled && context.completedDistanceMiles > 50) {
    reasons.push("Trip progress stalled unexpectedly");
  }

  const active = reasons.length > 0;
  return {
    active,
    reasons,
    message: active
      ? `Safety check suggested: ${reasons.join("; ")}. This does not contact emergency services.`
      : "No elevated safety concerns right now.",
  };
}

export function buildSafetyStatus(input: {
  relayState: SafetyRelayState;
  emergency: EmergencySuggestion;
  twilioConfigured?: boolean;
}): SafetyStatus {
  const preferences = getSafetyPreferences();
  const activeContacts = getActiveContacts().length;
  return {
    relayEnabled: preferences.relayEnabled,
    activeContacts,
    mode: input.twilioConfigured ? "twilio" : "simulated",
    lastBroadcast: input.relayState.lastBroadcast,
    emergency: input.emergency,
  };
}

export async function processSafetyRelay(input: {
  tripId: string;
  context: TripBroadcastContext;
  previousCompletedMiles: number;
  stopCount: number;
  previousStopCount: number;
  gpsSampleAgeMs: number | null;
}): Promise<{
  state: SafetyRelayState;
  previews: string[];
  emergency: EmergencySuggestion;
}> {
  const preferences = getSafetyPreferences();
  let state = loadRelayState(input.tripId);

  const now = Date.now();
  const gpsStale =
    input.gpsSampleAgeMs !== null ? input.gpsSampleAgeMs > GPS_LOST_MS : false;
  const tripStalled = now - state.lastProgressMs > STALL_MS;

  const enrichedContext: TripBroadcastContext = {
    ...input.context,
    gpsStale,
    tripStalled,
  };

  const emergency = evaluateEmergencySuggestion(enrichedContext);

  if (gpsStale && state.gpsLostSinceMs === null) {
    state = { ...state, gpsLostSinceMs: now };
  } else if (!gpsStale) {
    state = { ...state, gpsLostSinceMs: null };
  }

  if (input.previousCompletedMiles !== input.context.completedDistanceMiles) {
    state = { ...state, lastProgressMs: now };
  }

  const { events, nextState } = evaluateBroadcastTriggers({
    state,
    context: enrichedContext,
    preferences,
    previousCompletedMiles: input.previousCompletedMiles,
    stopCount: input.stopCount,
    previousStopCount: input.previousStopCount,
  });

  let workingState = nextState;
  const filtered = filterEventsByPreferences(events, preferences);

  if (emergency.active && preferences.relayEnabled) {
    const emergencyKey = `${input.tripId}:emergency_suggestion`;
    if (!workingState.sentEventKeys.includes(emergencyKey)) {
      filtered.push("emergency_suggestion");
      workingState = {
        ...workingState,
        sentEventKeys: [...workingState.sentEventKeys, emergencyKey],
      };
    }
  }

  const messages = buildMessagesForEvents(filtered, enrichedContext);
  const contacts = getActiveContacts();
  const previews = messages.map((message) => message.body);

  if (preferences.relayEnabled && contacts.length > 0 && messages.length > 0) {
    for (const message of messages) {
      const { mode, results } = await broadcastToContacts({
        contacts: contacts.map((contact) => ({ id: contact.id, phone: contact.phone })),
        message,
      });
      const lastBroadcast: LastBroadcastRecord = {
        body: message.body,
        eventType: message.eventType,
        sentAtMs: Date.now(),
        contactCount: results.filter((item) => item.ok).length,
        mode,
      };
      workingState = { ...workingState, lastBroadcast };
    }
  } else if (messages.length > 0) {
    const preview = messages[messages.length - 1];
    workingState = {
      ...workingState,
      lastBroadcast: {
        body: preview.body,
        eventType: preview.eventType,
        sentAtMs: Date.now(),
        contactCount: 0,
        mode: "simulated",
      },
    };
  }

  saveRelayState(workingState);

  return {
    state: workingState,
    previews,
    emergency,
  };
}
