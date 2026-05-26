import { ui } from "@/components/ui/theme";
import type { TripTrackingState } from "@/services/location/types";

type MovementStatusProps = {
  tracking: TripTrackingState;
};

export function MovementStatus({ tracking }: MovementStatusProps) {
  return (
    <section data-testid="movement-status" className={ui.panelNested}>
      <h3 className={ui.h3}>Movement</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className={ui.chip}>
          <p className={ui.statLabel}>State</p>
          <p data-testid="movement-state" className={`mt-1 ${ui.value}`}>
            {tracking.movementState}
          </p>
        </div>
        <div className={ui.chip}>
          <p className={ui.statLabel}>Speed</p>
          <p data-testid="movement-speed" className={`mt-1 ${ui.value}`}>
            {tracking.speedMph} mph
          </p>
        </div>
        <div className={ui.chip}>
          <p className={ui.statLabel}>Idle</p>
          <p data-testid="movement-idle" className={`mt-1 ${ui.value}`}>
            {tracking.idleMinutes} min
          </p>
        </div>
        <div className={ui.chip}>
          <p className={ui.statLabel}>Heading</p>
          <p data-testid="movement-heading" className={`mt-1 ${ui.value}`}>
            {tracking.heading === null ? "N/A" : `${Math.round(tracking.heading)}°`}
          </p>
        </div>
      </div>
    </section>
  );
}
