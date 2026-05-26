"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { ui } from "@/components/ui/theme";
import {
  getSafetyPreferences,
  subscribeSafetyStorage,
  updateSafetyPreferences,
} from "@/services/safety/contactManager";
import {
  defaultSafetyPreferences,
  type UpdateFrequency,
} from "@/services/safety/types";
import { buildBroadcastPreview } from "@/services/safety/smsRelay";
import { buildSafetyStatus, loadRelayState } from "@/services/safety/safetyEngine";
import type { TripBroadcastContext } from "@/services/safety/types";
import { BroadcastPreview } from "./BroadcastPreview";
import { ContactManager } from "./ContactManager";
import { SafetyStatus } from "./SafetyStatus";

type FamilySafetyPanelProps = {
  tripId?: string;
  broadcastContext?: TripBroadcastContext | null;
};

const frequencyOptions: { id: UpdateFrequency; label: string }[] = [
  { id: "every_50_miles", label: "Every 50 mi" },
  { id: "every_100_miles", label: "Every 100 mi" },
  { id: "every_200_miles", label: "Every 200 mi" },
];

export function FamilySafetyPanel({ tripId, broadcastContext }: FamilySafetyPanelProps) {
  const [previewEvent, setPreviewEvent] = useState<"trip_started" | "progress_milestone" | "arrival">(
    "trip_started",
  );

  const preferences = useSyncExternalStore(
    subscribeSafetyStorage,
    getSafetyPreferences,
    () => defaultSafetyPreferences,
  );

  const relayState = useMemo(() => (tripId ? loadRelayState(tripId) : null), [tripId]);

  const previewContext: TripBroadcastContext = broadcastContext ?? {
    driverName: preferences.driverDisplayName,
    startPlace: "Origin",
    destinationPlace: "Destination",
    currentPlaceLabel: "on route",
    totalDistanceMiles: 1000,
    completedDistanceMiles: 420,
    etaLabel: "Fri 8:40 PM",
    fuelRangeMiles: 180,
    weatherRisk: "LOW",
    weatherSummary: "Clear skies",
    fatigueStatus: "NORMAL",
    operationalStatus: "NORMAL",
    nextStopName: "Travel plaza",
    isOvernightStop: false,
    gpsStale: false,
    tripStalled: false,
  };

  const preview = buildBroadcastPreview(previewEvent, previewContext).body;

  const status = buildSafetyStatus({
    relayState: relayState ?? {
      tripId: tripId ?? "idle",
      lastMilestoneMiles: 0,
      lastEtaMinutes: null,
      sentEventKeys: [],
      lastBroadcast: null,
      gpsLostSinceMs: null,
      lastProgressMs: 0,
    },
    emergency: {
      active: false,
      reasons: [],
      message: "No elevated safety concerns right now.",
    },
  });

  return (
    <section data-testid="family-safety-panel" className="space-y-4">
      <div className={ui.panelNested}>
        <h2 className={ui.h2}>Family safety relay</h2>
        <p className={`mt-2 ${ui.body}`}>
          Flight-style progress updates for trusted contacts during long solo trips.
        </p>

        <label className={`mt-4 flex items-center gap-3 ${ui.panelInset}`}>
          <input
            data-testid="safety-relay-toggle"
            type="checkbox"
            checked={preferences.relayEnabled}
            onChange={(event) =>
              updateSafetyPreferences({ relayEnabled: event.target.checked })
            }
            className="h-5 w-5 accent-sky-400"
          />
          <span className={ui.body}>Enable automated SMS relay (opt-in)</span>
        </label>

        <label className={`mt-3 flex items-center gap-3 ${ui.panelInset}`}>
          <input
            data-testid="safety-emergency-only-toggle"
            type="checkbox"
            checked={preferences.emergencyOnly}
            onChange={(event) =>
              updateSafetyPreferences({ emergencyOnly: event.target.checked })
            }
            className="h-5 w-5 accent-amber-400"
          />
          <span className={ui.body}>Emergency-only mode</span>
        </label>

        <label className={`mt-3 block ${ui.body}`}>
          Driver name for messages
          <input
            data-testid="safety-driver-name"
            type="text"
            value={preferences.driverDisplayName}
            onChange={(event) =>
              updateSafetyPreferences({ driverDisplayName: event.target.value })
            }
            className={`mt-2 ${ui.input}`}
          />
        </label>

        <label className={`mt-3 block ${ui.body}`}>
          Update frequency
          <select
            data-testid="safety-update-frequency"
            value={preferences.updateFrequency}
            onChange={(event) =>
              updateSafetyPreferences({
                updateFrequency: event.target.value as UpdateFrequency,
              })
            }
            className={`mt-2 ${ui.input}`}
          >
            {frequencyOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <SafetyStatus status={status} />
      <ContactManager />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="preview-event-started"
          onClick={() => setPreviewEvent("trip_started")}
          className={ui.btnSecondary}
        >
          Preview: started
        </button>
        <button
          type="button"
          data-testid="preview-event-progress"
          onClick={() => setPreviewEvent("progress_milestone")}
          className={ui.btnSecondary}
        >
          Preview: progress
        </button>
        <button
          type="button"
          data-testid="preview-event-arrival"
          onClick={() => setPreviewEvent("arrival")}
          className={ui.btnSecondary}
        >
          Preview: arrival
        </button>
      </div>

      <BroadcastPreview preview={preview} eventLabel={previewEvent.replace("_", " ")} />
    </section>
  );
}
