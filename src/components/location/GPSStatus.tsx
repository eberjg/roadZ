import { ui } from "@/components/ui/theme";
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
    <section data-testid="gps-status" className={ui.panelNested}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className={ui.h3}>GPS Status</h3>
        <span data-testid="gps-health" className={ui.badge}>
          {gpsHealthLabel[tracking.gpsHealth]}
        </span>
      </div>
      <p className={`mt-2 ${ui.body}`}>
        Permission: <span data-testid="gps-permission">{tracking.permission}</span>
      </p>
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
        <button
          data-testid="gps-enable-btn"
          type="button"
          onClick={onEnableGps}
          className={ui.btnPrimary}
        >
          Enable GPS
        </button>
        <button
          data-testid="gps-live-mode-btn"
          type="button"
          onClick={onUseLive}
          className={ui.btnSecondary}
        >
          Live Mode
        </button>
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
