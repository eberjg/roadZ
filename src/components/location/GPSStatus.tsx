import type { TripTrackingState } from "@/services/location/types";

type GPSStatusProps = {
  tracking: TripTrackingState;
  onEnableGps: () => void;
  onUseManual: () => void;
  onUseLive: () => void;
};

const gpsHealthLabel: Record<TripTrackingState["gpsHealth"], string> = {
  good: "GPS healthy",
  stale: "GPS stale",
  low_accuracy: "Low accuracy",
  denied: "Permission denied",
  unavailable: "GPS unavailable",
};

export function GPSStatus({
  tracking,
  onEnableGps,
  onUseManual,
  onUseLive,
}: GPSStatusProps) {
  return (
    <section
      data-testid="gps-status"
      className="rounded-2xl border-2 border-zinc-900 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-2xl font-bold text-zinc-900">GPS Status</h3>
        <span
          data-testid="gps-health"
          className="rounded-full border-2 border-zinc-700 bg-zinc-100 px-3 py-1 text-sm font-bold text-zinc-900"
        >
          {gpsHealthLabel[tracking.gpsHealth]}
        </span>
      </div>
      <p className="mt-2 text-lg text-zinc-700">
        Permission: <span data-testid="gps-permission">{tracking.permission}</span>
      </p>
      {tracking.permission === "prompt" || tracking.permission === "unknown" ? (
        <p className="mt-2 text-lg text-zinc-600">
          Tap <strong>Enable GPS</strong> — Safari will ask to allow location for this site.
        </p>
      ) : null}
      {tracking.error ? (
        <p data-testid="gps-error" className="mt-2 text-lg font-semibold text-red-700">
          {tracking.error}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          data-testid="gps-enable-btn"
          type="button"
          onClick={onEnableGps}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-lg font-semibold text-white"
        >
          Enable GPS
        </button>
        <button
          data-testid="gps-live-mode-btn"
          type="button"
          onClick={onUseLive}
          className="rounded-lg border-2 border-zinc-900 px-4 py-2 text-lg font-semibold text-zinc-900"
        >
          Live Mode
        </button>
        <button
          data-testid="gps-manual-mode-btn"
          type="button"
          onClick={onUseManual}
          className="rounded-lg border-2 border-zinc-900 px-4 py-2 text-lg font-semibold text-zinc-900"
        >
          Manual Fallback
        </button>
      </div>
    </section>
  );
}
