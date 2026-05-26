"use client";

import { useSyncExternalStore } from "react";
import {
  defaultDashboardPreferences,
  getDashboardPreferences,
  subscribeAppStorage,
  updateDashboardPreferences,
} from "@/services/preferences/appStorage";
import { clearTripSession } from "@/services/preferences/tripSessionStorage";

type TripSessionBarProps = {
  tripRestored: boolean;
  showLiveData: boolean;
  onStartNewTrip: () => void;
};

export function TripSessionBar({
  tripRestored,
  showLiveData,
  onStartNewTrip,
}: TripSessionBarProps) {
  const preferences = useSyncExternalStore(
    subscribeAppStorage,
    () => getDashboardPreferences(),
    () => defaultDashboardPreferences,
  );

  return (
    <div className="pointer-events-auto flex flex-col gap-2">
      {tripRestored ? (
        <p
          data-testid="trip-restored-banner"
          className="rounded-xl border border-sky-500/40 bg-sky-950/80 px-3 py-2 text-xs text-sky-100 backdrop-blur-md"
        >
          Resumed your last trip from this device.
        </p>
      ) : null}
      {!showLiveData ? (
        <p
          data-testid="static-mode-banner"
          className="rounded-xl border border-amber-500/40 bg-amber-950/80 px-3 py-2 text-xs text-amber-100 backdrop-blur-md"
        >
          Static mode — live GPS and auto progress are paused.
        </p>
      ) : null}
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 backdrop-blur-md">
        <input
          data-testid="toggle-live-data"
          type="checkbox"
          checked={preferences.showLiveData}
          onChange={(event) => {
            updateDashboardPreferences({ showLiveData: event.target.checked });
          }}
          className="h-5 w-5 shrink-0 accent-cyan-400"
        />
        <span className="text-xs font-semibold text-white">Live dynamic data</span>
      </label>
      <button
        type="button"
        data-testid="btn-start-new-trip"
        onClick={() => {
          clearTripSession();
          onStartNewTrip();
        }}
        className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 backdrop-blur-md"
      >
        Start new trip
      </button>
    </div>
  );
}
