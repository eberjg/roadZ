import type {
  BroadcastEventType,
  BroadcastMessage,
  RelayDeliveryMode,
  RelaySendResult,
  TripBroadcastContext,
} from "./types";

export function formatSafetyMessage(
  eventType: BroadcastEventType,
  context: TripBroadcastContext,
): string {
  const percent =
    context.totalDistanceMiles > 0
      ? Math.round((context.completedDistanceMiles / context.totalDistanceMiles) * 100)
      : 0;

  const baseLines = [
    `${context.driverName} is currently near ${context.currentPlaceLabel}.`,
    `Trip progress: ${percent}%`,
    `ETA ${context.destinationPlace}: ${context.etaLabel}`,
    `Fuel range: ~${context.fuelRangeMiles} mi`,
    `Weather risk: ${context.weatherRisk.toLowerCase()}`,
  ];

  switch (eventType) {
    case "trip_started":
      return [
        `roadZ · Trip started`,
        `${context.driverName} left ${context.startPlace} heading to ${context.destinationPlace}.`,
        `Planned distance: ${context.totalDistanceMiles.toLocaleString()} mi.`,
        `Updates will follow while driving.`,
      ].join("\n");
    case "arrival":
      return [
        `roadZ · Arrived safely`,
        `${context.driverName} reached ${context.destinationPlace}.`,
        `Trip complete. No further updates will be sent.`,
      ].join("\n");
    case "fuel_stop":
      return [
        `roadZ · Fuel stop`,
        ...baseLines,
        `Stop: ${context.nextStopName ?? "planned fuel stop"}.`,
      ].join("\n");
    case "overnight_stop":
      return [
        `roadZ · Overnight stop`,
        ...baseLines,
        `Rest stop reached. Movement paused for extended break.`,
      ].join("\n");
    case "severe_weather":
      return [
        `roadZ · Weather alert`,
        ...baseLines,
        `Conditions: ${context.weatherSummary}`,
        `Drive with extra caution.`,
      ].join("\n");
    case "eta_drift":
      return [
        `roadZ · ETA update`,
        ...baseLines,
        `Arrival time shifted significantly. Updated ETA shared for planning.`,
      ].join("\n");
    case "high_fatigue":
      return [
        `roadZ · Fatigue notice`,
        ...baseLines,
        `Fatigue level: ${context.fatigueStatus.replace("_", " ")}.`,
        `Consider a rest break soon.`,
      ].join("\n");
    case "emergency_suggestion":
      return [
        `roadZ · Safety check suggested`,
        `${context.driverName} may need a wellness check.`,
        `Status: ${context.operationalStatus.replace("_", " ")}.`,
        `This is not an automatic emergency services alert.`,
        `Please contact the driver when safe.`,
      ].join("\n");
  }

  return [`roadZ · Progress update`, ...baseLines].join("\n");
}

export function buildBroadcastPreview(
  eventType: BroadcastEventType,
  context: TripBroadcastContext,
): BroadcastMessage {
  return {
    eventType,
    body: formatSafetyMessage(eventType, context),
    createdAtMs: Date.now(),
  };
}

export async function sendRelaySms(input: {
  to: string;
  body: string;
}): Promise<RelaySendResult> {
  try {
    const response = await fetch("/api/safety/sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload = (await response.json()) as RelaySendResult & { error?: string };
    if (!response.ok) {
      return {
        ok: false,
        mode: payload.mode ?? "simulated",
        contactId: input.to,
        error: payload.error ?? "SMS relay failed",
      };
    }
    return payload;
  } catch (error) {
    return {
      ok: false,
      mode: "simulated",
      contactId: input.to,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

export async function broadcastToContacts(input: {
  contacts: Array<{ id: string; phone: string }>;
  message: BroadcastMessage;
}): Promise<{ results: RelaySendResult[]; mode: RelayDeliveryMode }> {
  const results: RelaySendResult[] = [];
  let mode: RelayDeliveryMode = "simulated";

  for (const contact of input.contacts) {
    const result = await sendRelaySms({
      to: contact.phone,
      body: input.message.body,
    });
    results.push({ ...result, contactId: contact.id });
    if (result.mode === "twilio") {
      mode = "twilio";
    }
  }

  return { results, mode };
}
