"use client";

import { ui } from "@/components/ui/theme";

type DriverCopilotBannerProps = {
  startPlace: string;
  destinationPlace: string;
  completedDistanceMiles: number;
  totalDistanceMiles: number;
  liveDataEnabled: boolean;
  tripRestored: boolean;
};

export function DriverCopilotBanner({
  startPlace,
  destinationPlace,
  completedDistanceMiles,
  totalDistanceMiles,
  liveDataEnabled,
  tripRestored,
}: DriverCopilotBannerProps) {
  const remaining = Math.max(0, totalDistanceMiles - completedDistanceMiles);
  const percent =
    totalDistanceMiles > 0
      ? Math.min(100, Math.round((completedDistanceMiles / totalDistanceMiles) * 100))
      : 0;

  return (
    <section
      data-testid="driver-copilot-banner"
      className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 to-sky-500/10 px-4 py-4 shadow-lg shadow-black/30"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
        Live driving co-pilot
      </p>
      <p className={`mt-2 ${ui.value}`}>
        {startPlace} → {destinationPlace}
      </p>
      <p className={`mt-2 ${ui.body}`} data-testid="driver-copilot-progress">
        {completedDistanceMiles.toLocaleString()} mi done · {remaining.toLocaleString()} mi left ·{" "}
        {percent}% complete
      </p>
      <p className={`mt-2 ${ui.bodyMuted}`} data-testid="driver-copilot-status">
        {tripRestored
          ? "Continuing where you left off — your trip is saved on this device."
          : liveDataEnabled
            ? "Following your route live — GPS, fuel, and weather update as you go."
            : "Static snapshot mode — turn on Live dynamic data for live updates."}
      </p>
    </section>
  );
}
