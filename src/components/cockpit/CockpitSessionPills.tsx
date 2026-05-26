"use client";

import { useState } from "react";
import { useSyncExternalStore } from "react";
import {
  defaultDashboardPreferences,
  getDashboardPreferences,
  subscribeAppStorage,
  updateDashboardPreferences,
} from "@/services/preferences/appStorage";
import { clearTripSession } from "@/services/preferences/tripSessionStorage";
import { cockpitGlassCompact } from "./cockpitStyles";

type CockpitSessionPillsProps = {
  tripRestored: boolean;
  showLiveData: boolean;
  onStartNewTrip: () => void;
};

/** Slim top pills — never block the map center. */
export function CockpitSessionPills({
  tripRestored,
  showLiveData,
  onStartNewTrip,
}: CockpitSessionPillsProps) {
  const [restoreDismissed, setRestoreDismissed] = useState(false);
  const preferences = useSyncExternalStore(
    subscribeAppStorage,
    () => getDashboardPreferences(),
    () => defaultDashboardPreferences,
  );

  const showRestore = tripRestored && !restoreDismissed;

  return (
    <div className="pointer-events-auto flex flex-col gap-1">
      {showRestore ? (
        <div
          data-testid="trip-restored-banner"
          className={`${cockpitGlassCompact} flex items-center justify-between gap-2 px-3 py-1.5`}
        >
          <p className="truncate text-[11px] text-sky-200">Resumed your last trip</p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setRestoreDismissed(true)}
            className="shrink-0 text-xs text-zinc-400"
          >
            ✕
          </button>
        </div>
      ) : null}

      {!showLiveData ? (
        <p
          data-testid="static-mode-banner"
          className={`${cockpitGlassCompact} px-3 py-1.5 text-center text-[11px] text-amber-200`}
        >
          Static mode — GPS paused
        </p>
      ) : null}

      <div className={`${cockpitGlassCompact} flex items-center justify-between gap-2 px-3 py-1.5`}>
        <label className="flex min-w-0 cursor-pointer items-center gap-2">
          <input
            data-testid="toggle-live-data"
            type="checkbox"
            checked={preferences.showLiveData}
            onChange={(event) => {
              updateDashboardPreferences({ showLiveData: event.target.checked });
            }}
            className="h-4 w-4 shrink-0 accent-cyan-400"
          />
          <span className="truncate text-[11px] font-medium text-zinc-200">
            Live data
            {showLiveData ? (
              <span className="ml-1 font-normal text-zinc-500">· GPS on map</span>
            ) : null}
          </span>
        </label>
        <button
          type="button"
          data-testid="btn-start-new-trip"
          onClick={() => {
            clearTripSession();
            onStartNewTrip();
          }}
          className="shrink-0 text-[11px] font-semibold text-zinc-400 underline-offset-2 hover:text-white hover:underline"
        >
          New trip
        </button>
      </div>
    </div>
  );
}
