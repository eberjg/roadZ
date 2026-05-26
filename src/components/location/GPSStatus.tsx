import { ui } from "@/components/ui/theme";
import type { TripTrackingState } from "@/services/location/types";

type GPSStatusProps = {
  tracking: TripTrackingState;
  onEnableGps: () => void;
  onUseManual: () => void;
  onUseLive: () => void;
};

const gpsHealthLabel: Record<TripTrackingState["gpsHealth"], string> = {
  good: "GPS active",
  acquiring: "Acquiring GPS…",
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
  const permissionGranted = tracking.permission === "granted";
  const showEnableButton =
    !permissionGranted &&
    tracking.permission !== "denied" &&
    tracking.permission !== "unsupported";

  return (
    <section data-testid="gps-status" className={ui.panelNested}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className={ui.h3}>GPS Status</h3>
        <span data-testid="gps-health" className={ui.badge}>
          {gpsHealthLabel[tracking.gpsHealth]}
        </span>
      </div>

      <p className={`mt-2 ${ui.body}`} data-testid="gps-permission">
        {tracking.permission}
      </p>
      {permissionGranted ? (
        <p data-testid="gps-granted-hint" className={`mt-1 ${ui.bodyMuted}`}>
          Location allowed ·{" "}
          {tracking.mode === "live" ? "live tracking on" : "tap Start Live Mode"}
        </p>
      ) : null}

      {tracking.permission === "prompt" || tracking.permission === "unknown" ? (
        <p className={`mt-2 ${ui.bodyMuted}`}>
          Tap <strong className="text-white">Enable GPS</strong> — Safari will ask to allow
          location for this site.
        </p>
      ) : null}

      {tracking.error ? (
        <p data-testid="gps-error" className={`mt-2 ${ui.errorText}`}>
          {tracking.error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        {showEnableButton ? (
          <button
            data-testid="gps-enable-btn"
            type="button"
            onClick={onEnableGps}
            className={ui.btnPrimary}
          >
            Enable GPS
          </button>
        ) : null}

        {permissionGranted && tracking.mode === "manual" ? (
          <button
            data-testid="gps-live-mode-btn"
            type="button"
            onClick={onUseLive}
            className={ui.btnPrimary}
          >
            Start Live Mode
          </button>
        ) : null}

        {permissionGranted && tracking.mode === "live" ? (
          <span
            data-testid="gps-live-active"
            className={`inline-flex items-center rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-lg font-semibold text-emerald-300`}
          >
            Live tracking on
          </span>
        ) : null}

        {tracking.permission === "denied" ? (
          <button
            data-testid="gps-enable-btn"
            type="button"
            onClick={onEnableGps}
            className={ui.btnSecondary}
          >
            Retry GPS
          </button>
        ) : null}

        <button
          data-testid="gps-manual-mode-btn"
          type="button"
          onClick={onUseManual}
          className={ui.btnSecondary}
        >
          Manual Fallback
        </button>
      </div>
    </section>
  );
}
