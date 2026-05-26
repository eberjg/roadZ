"use client";

import { useSyncExternalStore } from "react";
import { ui } from "@/components/ui/theme";
import {
  defaultDashboardPreferences,
  getDashboardPreferences,
  subscribeAppStorage,
  updateDashboardPreferences,
} from "@/services/preferences/appStorage";
import { clearTripSession } from "@/services/preferences/tripSessionStorage";

type DashboardSettingsProps = {
  hasActiveTrip: boolean;
  tripRestored: boolean;
  onStartNewTrip: () => void;
};

export function DashboardSettings({
  hasActiveTrip,
  tripRestored,
  onStartNewTrip,
}: DashboardSettingsProps) {
  const showRestoredBanner = tripRestored && hasActiveTrip;
  const preferences = useSyncExternalStore(
    subscribeAppStorage,
    () => getDashboardPreferences(),
    () => defaultDashboardPreferences,
  );

  return (
    <section data-testid="dashboard-settings" className={ui.panel}>
      <h2 className={ui.h2}>Display</h2>
      <p className={`mt-2 ${ui.body}`}>
        Choose how much updates while you drive. Your trip is always saved when you close the app.
      </p>

      {showRestoredBanner ? (
        <p
          data-testid="trip-restored-banner"
          className={`mt-4 rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 ${ui.body}`}
        >
          Resumed your last trip from this device.
        </p>
      ) : null}

      <label className={`mt-5 flex cursor-pointer items-start gap-4 rounded-xl ${ui.panelInset}`}>
        <input
          data-testid="toggle-live-data"
          type="checkbox"
          checked={preferences.showLiveData}
          onChange={(event) => {
            updateDashboardPreferences({ showLiveData: event.target.checked });
          }}
          className="mt-1 h-6 w-6 shrink-0 accent-sky-400"
        />
        <span>
          <span className="block text-lg font-semibold text-white">Live dynamic data</span>
          <span className={`mt-1 block ${ui.bodyMuted}`}>
            ON: GPS movement, auto progress, weather refresh. OFF: calm static snapshot — better
            for passengers or low distraction.
          </span>
        </span>
      </label>

      {hasActiveTrip ? (
        <button
          type="button"
          data-testid="btn-start-new-trip"
          onClick={() => {
            clearTripSession();
            onStartNewTrip();
          }}
          className={`mt-5 ${ui.btnSecondary}`}
        >
          Start new trip
        </button>
      ) : null}
    </section>
  );
}
